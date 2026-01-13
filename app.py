from flask import Flask, request, jsonify, g, render_template, send_from_directory
from flask_cors import CORS
import pymysql
import json
import os
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import jwt
import functools
import re
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load environment variables from .env file
load_dotenv()

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-secret-key-change-this')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 720  # 30 days
# Email Configuration
SMTP_EMAIL = os.getenv('SMTP_EMAIL')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))

# OTP Storage (In-memory)
# Format: { 'email@adventz.com': { 'otp': '123456', 'expires_at': datetime_object } }
otp_store = {}

# Configure the Flask app to look for templates in the 'templates' folder
# and serve static files from a 'static' folder.
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)  # Enable Cross-Origin Resource Sharing

# MySQL Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'idea_ticketing'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if 'db' not in g:
        g.db = pymysql.connect(**DB_CONFIG)
    return g.db

@app.teardown_appcontext
def close_db(exception):
    """Closes the database again at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def create_database_if_not_exists():
    """Creates the database if it doesn't exist."""
    conn = pymysql.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password']
    )
    try:
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        conn.commit()
    finally:
        conn.close()

def init_db():
    """Initializes and migrates the database to the latest schema."""
    create_database_if_not_exists()
    
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        
        # --- Schema Definition ---
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                full_name VARCHAR(255)
            )
        ''')
        # Create ideas table (without last_edited_at initially for migration purposes)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ideas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                employeeName VARCHAR(255),
                company VARCHAR(255),
                ideaTitle VARCHAR(500),
                ideaCategory VARCHAR(255),
                problemStatement TEXT,
                proposedSolution TEXT,
                expectedBenefits TEXT,
                departmentsImpacted TEXT,
                availabilityOfData VARCHAR(255),
                dataSources TEXT,
                estimatedCost VARCHAR(255),
                implementationTimeline VARCHAR(255),
                status VARCHAR(50),
                submissionDate VARCHAR(50),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        # Create notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                idea_id INT NOT NULL,
                message TEXT NOT NULL,
                is_read TINYINT NOT NULL DEFAULT 0,
                created_at VARCHAR(50) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (idea_id) REFERENCES ideas (id)
            )
        ''')
        # Create comments table for history log
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                idea_id INT NOT NULL,
                user_id INT NOT NULL,
                comment TEXT NOT NULL,
                created_at VARCHAR(50) NOT NULL,
                FOREIGN KEY (idea_id) REFERENCES ideas(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

        # Create idea_reactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS idea_reactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                idea_id INT NOT NULL,
                user_id INT NOT NULL,
                reaction_type VARCHAR(10) CHECK(reaction_type IN ('like', 'dislike')),
                UNIQUE KEY unique_reaction (idea_id, user_id),
                FOREIGN KEY (idea_id) REFERENCES ideas(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

        # --- Schema Migrations ---
        # This section ensures old databases are updated automatically.
        cursor.execute("SHOW COLUMNS FROM ideas LIKE 'last_edited_at'")
        result = cursor.fetchone()
        
        if result is None:
            print("Applying migration: Adding 'last_edited_at' column to 'ideas' table.")
            cursor.execute('ALTER TABLE ideas ADD COLUMN last_edited_at VARCHAR(50)')
        
        # Migration for full_name in users table
        cursor.execute("SHOW COLUMNS FROM users LIKE 'full_name'")
        result = cursor.fetchone()
        if result is None:
            print("Applying migration: Adding 'full_name' column to 'users' table.")
            cursor.execute('ALTER TABLE users ADD COLUMN full_name VARCHAR(255)')

        # Migration to update role column check constraint to allow 'hr'
        # Drop existing check constraint if it exists and add a new one that includes 'hr'
        try:
            # Check if the constraint exists
            cursor.execute("""
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = %s 
                AND TABLE_NAME = 'users' 
                AND CONSTRAINT_TYPE = 'CHECK'
            """, (DB_CONFIG['database'],))
            constraints = cursor.fetchall()
            
            # Drop all check constraints on users table
            for constraint in constraints:
                constraint_name = constraint['CONSTRAINT_NAME']
                print(f"Dropping check constraint: {constraint_name}")
                cursor.execute(f"ALTER TABLE users DROP CHECK {constraint_name}")
            
            # Add new check constraint that includes all valid roles including 'hr'
            print("Adding updated check constraint for role column")
            cursor.execute("""
                ALTER TABLE users 
                ADD CONSTRAINT users_role_check 
                CHECK (role IN ('user', 'admin', 'ceo', 'hr', 'superadmin'))
            """)
            db.commit()
        except Exception as e:
            print(f"Check constraint migration completed or not needed: {e}")
            pass

        # The 'adminComments' column is now obsolete and ignored by the application.
        # No action is needed if it exists in older database files.

        # --- Default Data ---
        # Check if the default admin exists, if not, create it
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@adventz.com')
        admin_password = os.getenv('ADMIN_PASSWORD', '12345')

        cursor.execute("SELECT * FROM users WHERE email = %s", (admin_email,))
        if cursor.fetchone() is None:
            hashed_password = generate_password_hash(admin_password)
            cursor.execute(
                "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
                (admin_email, hashed_password, 'admin')
            )
        
        # Check if the default CEO exists, if not, create it
        ceo_email = os.getenv('CEO_EMAIL', 'ceo@adventz.com')
        ceo_password = os.getenv('CEO_PASSWORD', '12345')

        cursor.execute("SELECT * FROM users WHERE email = %s", (ceo_email,))
        if cursor.fetchone() is None:
            hashed_password_ceo = generate_password_hash(ceo_password)
            cursor.execute(
                "INSERT INTO users (email, password, role, full_name) VALUES (%s, %s, %s, %s)",
                (ceo_email, hashed_password_ceo, 'ceo', 'Chief Executive Officer')
            )
        

        db.commit()

# --- Decorators ---
def token_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            g.current_user_id = data['user_id']
            g.current_user_role = data['role']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(*args, **kwargs)
    
    return decorated

# --- API Endpoints ---
def send_email_otp(to_email, otp):
    """Sends an OTP to the specified email address using Gmail SMTP."""
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print("SMTP credentials not configured.")
        return False
    
    msg = MIMEMultipart()
    msg['From'] = SMTP_EMAIL
    msg['To'] = to_email
    msg['Subject'] = "Your Verification OTP - Idea Ticketing System"
    
    body = f"""
    <html>
      <body>
        <h2>Email Verification</h2>
        <p>Your One-Time Password (OTP) for registration is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">{otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      </body>
    </html>
    """
    msg.attach(MIMEText(body, 'html'))
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_EMAIL, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    """Generates and sends an OTP to the user's email."""
    data = request.get_json()
    email = data.get('email', '').strip()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    if not email.endswith('@adventz.com'):
        return jsonify({'error': 'Only @adventz.com email addresses are allowed'}), 400

    # Generate 6-digit OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Store OTP with expiration (5 minutes from now)
    expiration_time = datetime.datetime.now() + datetime.timedelta(minutes=5)
    otp_store[email] = {
        'otp': otp,
        'expires_at': expiration_time
    }
    
    if send_email_otp(email, otp):
        return jsonify({'message': 'OTP sent successfully to your email.'}), 200
    else:
        return jsonify({'error': 'Failed to send OTP. Please try again later.'}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    """Handles user signup with email domain validation and OTP verification."""
    data = request.get_json()
    email = data.get('email', '').strip()
    full_name = data.get('fullName', '').strip()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirmPassword', '')
    otp = data.get('otp', '').strip()

    # Validation: Required fields
    if not all([email, full_name, phone, password, confirm_password, otp]):
        return jsonify({'error': 'All fields are required, including OTP'}), 400

    # Validation: Email domain must be @adventz.com
    if not email.endswith('@adventz.com'):
        return jsonify({'error': 'Only @adventz.com email addresses are allowed'}), 400

    # Validation: Verify OTP
    stored_otp_data = otp_store.get(email)
    if not stored_otp_data:
        return jsonify({'error': 'OTP not found or expired. Please request a new one.'}), 400
    
    if stored_otp_data['otp'] != otp:
        return jsonify({'error': 'Invalid OTP'}), 400
        
    if datetime.datetime.now() > stored_otp_data['expires_at']:
        del otp_store[email]
        return jsonify({'error': 'OTP has expired. Please request a new one.'}), 400

    # Validation: Password match
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400

    # Validation: Password strength (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    if not re.search(r'[A-Z]', password):
        return jsonify({'error': 'Password must contain at least one uppercase letter'}), 400
    if not re.search(r'[a-z]', password):
        return jsonify({'error': 'Password must contain at least one lowercase letter'}), 400
    if not re.search(r'[0-9]', password):
        return jsonify({'error': 'Password must contain at least one number'}), 400

    # Validation: Phone number (10 digits)
    if not re.match(r'^\d{10}$', phone):
        return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400

    # Hash password and create user
    hashed_password = generate_password_hash(password)
    db = get_db()
    
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (email, password, role, full_name) VALUES (%s, %s, %s, %s)",
            (email, hashed_password, 'user', full_name)
        )
        db.commit()
        
        # Clear OTP after successful signup
        if email in otp_store:
            del otp_store[email]
            
        return jsonify({'message': 'Account created successfully! Please login to continue.'}), 201
    except pymysql.IntegrityError:
        return jsonify({'error': 'An account with this email already exists'}), 409
    except Exception as e:
        return jsonify({'error': 'Failed to create account. Please try again.'}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Handles user login with JWT token generation."""
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()

    # Check if user exists and password is correct
    if user and check_password_hash(user['password'], password):
        # Determine Role logic
        role = user['role']


        # Generate JWT token
        expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
        token_payload = {
            'user_id': user['id'],
            'email': user['email'],
            'role': role,
            'fullName': user.get('full_name', ''),
            'exp': expiration
        }
        token = jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return jsonify({
            'isLoggedIn': True,
            'user': {'id': user['id'], 'email': user['email'], 'role': role, 'fullName': user.get('full_name', '')},
            'token': token
        }), 200

    return jsonify({'error': 'Invalid email or password'}), 401




@app.route('/api/users', methods=['GET'])
@token_required
def get_all_users():
    """Retrieves all registered users."""
    if g.current_user_role != 'admin' and g.current_user_role != 'superadmin':
        return jsonify({'error': 'Unauthorized access'}), 403

    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT id, email, role, full_name FROM users ORDER BY id DESC')
    users = cursor.fetchall()
    # Map full_name to fullName for frontend consistency if needed, though frontend likely uses specific keys
    for user in users:
        user['fullName'] = user.pop('full_name', None)
    return jsonify(users), 200


@app.route('/api/users/<int:user_id>/role', methods=['PUT'])
@token_required
def update_user_role(user_id):
    """Updates a user's role."""
    if g.current_user_role != 'admin' and g.current_user_role != 'superadmin':
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    new_role = data.get('role')

    valid_roles = ['user', 'admin', 'ceo', 'hr']
    if new_role not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400

    db = get_db()
    cursor = db.cursor()
    
    # Prevent changing own role
    if user_id == g.current_user_id:
         return jsonify({'error': 'Cannot change your own role'}), 400

    cursor.execute('UPDATE users SET role = %s WHERE id = %s', (new_role, user_id))
    db.commit()

    if cursor.rowcount > 0:
        return jsonify({'message': f'User role updated to {new_role}'}), 200
    return jsonify({'error': 'User not found'}), 404


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    """Deletes a user account."""
    if g.current_user_role != 'admin' and g.current_user_role != 'superadmin':
        return jsonify({'error': 'Unauthorized access'}), 403

    # Prevent deleting self
    if user_id == g.current_user_id:
         return jsonify({'error': 'Cannot delete your own account'}), 400

    db = get_db()
    cursor = db.cursor()
    
    # Delete related data first (cascade manually if not set in DB)
    cursor.execute('DELETE FROM notifications WHERE user_id = %s', (user_id,))
    cursor.execute('DELETE FROM comments WHERE user_id = %s', (user_id,))
    # For ideas, we might want to keep them but set user_id to NULL or a deleted user placeholder, 
    # but for now let's assume we delete them or if there's a FK constraint it might fail.
    # Looking at schema: FOREIGN KEY (user_id) REFERENCES users (id)
    # We should probably delete their ideas too to maintain integrity or the DB will error.
    # Let's delete ideas for now.
    cursor.execute('DELETE FROM ideas WHERE user_id = %s', (user_id,))
    
    cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
    db.commit()

    if cursor.rowcount > 0:
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'error': 'User not found'}), 404


@app.route('/api/users/<int:user_id>/password', methods=['PUT'])
@token_required
def reset_user_password(user_id):
    """Resets a user's password."""
    if g.current_user_role != 'admin' and g.current_user_role != 'superadmin':
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    new_password = data.get('password')

    if not new_password or len(new_password) < 5:
         return jsonify({'error': 'Password must be at least 5 characters long'}), 400

    hashed_password = generate_password_hash(new_password)
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE users SET password = %s WHERE id = %s', (hashed_password, user_id))
    db.commit()

    if cursor.rowcount > 0:
        return jsonify({'message': 'Password updated successfully'}), 200
    return jsonify({'error': 'User not found'}), 404


@app.route('/api/ideas', methods=['GET', 'POST'])
@token_required
def handle_ideas():
    """Handles creating and retrieving ideas. Notifies admins on new idea submission."""
    db = get_db()
    cursor = db.cursor()

    if request.method == 'POST':
        data = request.get_json()
        departments_impacted_json = json.dumps(data.get('departmentsImpacted', []))
        current_time = datetime.datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO ideas (user_id, employeeName, company, ideaTitle, ideaCategory, problemStatement, proposedSolution, expectedBenefits, departmentsImpacted, availabilityOfData, dataSources, estimatedCost, implementationTimeline, status, submissionDate, last_edited_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['userId'], data['employeeName'], data['company'], data['ideaTitle'], data['ideaCategory'],
            data['problemStatement'], data['proposedSolution'], data['expectedBenefits'],
            departments_impacted_json, data['availabilityOfData'], data.get('dataSources'),
            data.get('estimatedCost'), data['implementationTimeline'], data['status'],
            data['submissionDate'], current_time
        ))
        new_idea_id = cursor.lastrowid
        
        if data['status'] == 'Submitted':
            cursor.execute("SELECT id FROM users WHERE role = 'admin'")
            admins = cursor.fetchall()
            notification_message = f"New idea submitted by {data['employeeName']}: '{data['ideaTitle']}'"
            for admin in admins:
                cursor.execute(
                    'INSERT INTO notifications (user_id, idea_id, message, created_at) VALUES (%s, %s, %s, %s)',
                    (admin['id'], new_idea_id, notification_message, datetime.datetime.now().isoformat())
                )
        
        db.commit()
        return jsonify({'message': 'Idea submitted successfully', 'id': new_idea_id}), 201

    elif request.method == 'GET':
        query = '''
            SELECT i.*, u.email,
            (SELECT COUNT(*) FROM idea_reactions WHERE idea_id = i.id AND reaction_type = 'like') as likes,
            (SELECT COUNT(*) FROM idea_reactions WHERE idea_id = i.id AND reaction_type = 'dislike') as dislikes,
            (SELECT COALESCE(SUM(
                CASE 
                    WHEN r_u.role = 'ceo' AND ir.reaction_type = 'like' THEN 10
                    WHEN ir.reaction_type = 'like' THEN 1
                    WHEN ir.reaction_type = 'dislike' THEN -1
                    ELSE 0 
                END
            ), 0) FROM idea_reactions ir JOIN users r_u ON ir.user_id = r_u.id WHERE ir.idea_id = i.id) as points,
            (SELECT reaction_type FROM idea_reactions WHERE idea_id = i.id AND user_id = %s) as user_reaction
            FROM ideas i 
            JOIN users u ON i.user_id = u.id
        '''
        params = [g.current_user_id]
        where_clauses = []
        
        # Base filter: Only show Drafts if user is the owner
        where_clauses.append("(i.status != 'Draft' OR i.user_id = %s)")
        params.append(g.current_user_id)

        # Get filter parameters from query string
        search = request.args.get('search')
        status = request.args.get('status')
        category = request.args.get('category')
        company = request.args.get('company')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')

        if search:
            where_clauses.append('(i.ideaTitle LIKE %s OR i.employeeName LIKE %s)')
            params.extend([f'%{search}%', f'%{search}%'])
        
        if status:
            where_clauses.append('i.status = %s')
            params.append(status)
            
        if category:
            where_clauses.append('i.ideaCategory = %s')
            params.append(category)

        if company:
            where_clauses.append('i.company = %s')
            params.append(company)

        if start_date:
            where_clauses.append('DATE(i.submissionDate) >= %s')
            params.append(start_date)

        if end_date:
            where_clauses.append('DATE(i.submissionDate) <= %s')
            params.append(end_date)

        if where_clauses:
            query += ' WHERE ' + ' AND '.join(where_clauses)
        
        query += ' ORDER BY points DESC, i.submissionDate DESC' # Ordered by points then date

        cursor.execute(query, params)
        ideas = cursor.fetchall()
        for idea in ideas:
            idea['departmentsImpacted'] = json.loads(idea['departmentsImpacted'])
        return jsonify(ideas)


@app.route('/api/ideas/user/<int:user_id>', methods=['GET'])
@token_required
def get_user_ideas(user_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM ideas WHERE user_id = %s ORDER BY submissionDate DESC', (user_id,))
    ideas = cursor.fetchall()
    for idea in ideas:
        idea['departmentsImpacted'] = json.loads(idea['departmentsImpacted'])
    return jsonify(ideas)


@app.route('/api/ideas/<int:idea_id>', methods=['PUT', 'DELETE'])
@token_required
def update_delete_idea(idea_id):
    db = get_db()
    cursor = db.cursor()
    current_time = datetime.datetime.now().isoformat()

    if request.method == 'PUT':
        data = request.get_json()
        departments_impacted_json = json.dumps(data.get('departmentsImpacted', []))
        cursor.execute('''
            UPDATE ideas SET
                employeeName = %s, company = %s, ideaTitle = %s, ideaCategory = %s, problemStatement = %s,
                proposedSolution = %s, expectedBenefits = %s, departmentsImpacted = %s, availabilityOfData = %s,
                dataSources = %s, estimatedCost = %s, implementationTimeline = %s, status = %s, submissionDate = %s,
                last_edited_at = %s
            WHERE id = %s
        ''', (
            data['employeeName'], data['company'], data['ideaTitle'], data['ideaCategory'],
            data['problemStatement'], data['proposedSolution'], data['expectedBenefits'],
            departments_impacted_json, data['availabilityOfData'], data.get('dataSources'),
            data.get('estimatedCost'), data['implementationTimeline'], data['status'],
            data['submissionDate'], current_time, idea_id
        ))
        db.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Idea updated successfully'}), 200
        return jsonify({'error': 'Idea not found'}), 404

    elif request.method == 'DELETE':
        cursor.execute('DELETE FROM comments WHERE idea_id = %s', (idea_id,))
        cursor.execute('DELETE FROM notifications WHERE idea_id = %s', (idea_id,))
        cursor.execute('DELETE FROM idea_reactions WHERE idea_id = %s', (idea_id,))
        cursor.execute('DELETE FROM ideas WHERE id = %s', (idea_id,))
        db.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Idea withdrawn successfully'}), 200
        return jsonify({'error': 'Idea not found'}), 404


@app.route('/api/ideas/update-status', methods=['POST'])
@token_required
def update_idea_status():
    payload = request.get_json()
    updates = payload.get('updates', [])
    db = get_db()
    cursor = db.cursor()
    current_time = datetime.datetime.now().isoformat()
    
    for update_data in updates:
        idea_id = update_data.get('id')
        new_status = update_data.get('status')

        if not idea_id or not new_status:
            continue

        cursor.execute('SELECT user_id, ideaTitle, status FROM ideas WHERE id = %s', (idea_id,))
        idea = cursor.fetchone()
        if not idea:
            continue
        
        if new_status != idea['status']:
            cursor.execute('UPDATE ideas SET status = %s, last_edited_at = %s WHERE id = %s', (new_status, current_time, idea_id))
            message = f'The status of your idea "{idea["ideaTitle"]}" has been updated to "{new_status}".'
            cursor.execute(
                'INSERT INTO notifications (user_id, idea_id, message, created_at) VALUES (%s, %s, %s, %s)',
                (idea['user_id'], idea_id, message, datetime.datetime.now().isoformat())
            )

    db.commit()
    return jsonify({'message': 'Status changes saved and notifications sent successfully'}), 200


@app.route('/api/ideas/<int:idea_id>/react', methods=['POST'])
@token_required
def react_to_idea(idea_id):
    data = request.get_json()
    reaction_type = data.get('reactionType') # 'like' or 'dislike'

    if reaction_type not in ['like', 'dislike']:
        return jsonify({'error': 'Invalid reaction type'}), 400

    db = get_db()
    cursor = db.cursor()
    
    # Check if a reaction already exists
    cursor.execute('SELECT reaction_type FROM idea_reactions WHERE idea_id = %s AND user_id = %s', (idea_id, g.current_user_id))
    existing_reaction = cursor.fetchone()

    if existing_reaction:
        if existing_reaction['reaction_type'] == reaction_type:
            # If same reaction, remove it (toggle off)
            cursor.execute('DELETE FROM idea_reactions WHERE idea_id = %s AND user_id = %s', (idea_id, g.current_user_id))
            message = 'Reaction removed'
        else:
            # If different, update it
            cursor.execute('UPDATE idea_reactions SET reaction_type = %s WHERE idea_id = %s AND user_id = %s', (reaction_type, idea_id, g.current_user_id))
            message = 'Reaction updated'
    else:
        # Create new reaction
        cursor.execute('INSERT INTO idea_reactions (idea_id, user_id, reaction_type) VALUES (%s, %s, %s)', (idea_id, g.current_user_id, reaction_type))
        message = 'Reaction added'
    
    
    db.commit()

    # CEO Reaction Logic: Update Idea Status
    if g.current_user_role == 'ceo' and message in ['Reaction added', 'Reaction updated']:
        new_status = None
        if reaction_type == 'like':
            new_status = 'Approved'
        elif reaction_type == 'dislike':
            new_status = 'Rejected'
        
        if new_status:
            # Get idea details for notification
            cursor.execute('SELECT user_id, ideaTitle, status FROM ideas WHERE id = %s', (idea_id,))
            idea = cursor.fetchone()
            
            if idea and idea['status'] != new_status:
                current_time = datetime.datetime.now().isoformat()
                cursor.execute('UPDATE ideas SET status = %s, last_edited_at = %s WHERE id = %s', (new_status, current_time, idea_id))
                
                # Notify the idea owner
                notif_message = f'The status of your idea "{idea["ideaTitle"]}" has been updated to "{new_status}" by the CEO.'
                cursor.execute(
                    'INSERT INTO notifications (user_id, idea_id, message, created_at) VALUES (%s, %s, %s, %s)',
                    (idea['user_id'], idea_id, notif_message, current_time)
                )
                db.commit()

    db.commit()

    # Return updated counts and points
    cursor.execute("SELECT COUNT(*) as count FROM idea_reactions WHERE idea_id = %s AND reaction_type = 'like'", (idea_id,))
    likes = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) as count FROM idea_reactions WHERE idea_id = %s AND reaction_type = 'dislike'", (idea_id,))
    dislikes = cursor.fetchone()['count']

    # Calculate points for this idea
    cursor.execute('''
        SELECT COALESCE(SUM(
            CASE 
                WHEN u.role = 'ceo' AND ir.reaction_type = 'like' THEN 10
                WHEN ir.reaction_type = 'like' THEN 1
                WHEN ir.reaction_type = 'dislike' THEN -1
                ELSE 0 
            END
        ), 0) as points 
        FROM idea_reactions ir 
        JOIN users u ON ir.user_id = u.id 
        WHERE ir.idea_id = %s
    ''', (idea_id,))
    points = cursor.fetchone()['points']

    return jsonify({
        'message': message, 
        'likes': likes, 
        'dislikes': dislikes,
        'points': points,
        'user_reaction': reaction_type if message != 'Reaction removed' else None
    }), 200

# --- Comment Endpoints ---
@app.route('/api/ideas/<int:idea_id>/comments', methods=['GET', 'POST'])
@token_required
def manage_comments(idea_id):
    db = get_db()
    cursor = db.cursor()

    if request.method == 'GET':
        cursor.execute(
            '''
            SELECT c.id, c.comment, c.created_at, u.email, u.role
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.idea_id = %s
            ORDER BY c.created_at ASC
            ''',
            (idea_id,)
        )
        comments = cursor.fetchall()
        return jsonify(comments)
    
    if request.method == 'POST':
        data = request.get_json()
        user_id = data.get('userId')
        comment_text = data.get('comment')
        current_time = datetime.datetime.now().isoformat()

        if not user_id or not comment_text:
            return jsonify({'error': 'User ID and comment text are required'}), 400
        
        cursor.execute(
            'INSERT INTO comments (idea_id, user_id, comment, created_at) VALUES (%s, %s, %s, %s)',
            (idea_id, user_id, comment_text, current_time)
        )
        
        # Also update the last_edited_at timestamp on the idea
        cursor.execute('UPDATE ideas SET last_edited_at = %s WHERE id = %s', (current_time, idea_id))

        # Notify the idea owner that an admin has commented
        cursor.execute('SELECT user_id, ideaTitle FROM ideas WHERE id = %s', (idea_id,))
        idea = cursor.fetchone()
        submitter_id = idea['user_id']

        # Also notify all admins (except the one making the comment)
        cursor.execute('SELECT id FROM users WHERE role = "admin"')
        admins = cursor.fetchall()

        cursor.execute('SELECT email, role FROM users WHERE id = %s', (user_id,))
        commenter = cursor.fetchone()
        
        # Notify user if commenter is an admin
        if commenter['role'] == 'admin' and user_id != submitter_id:
            message = f'An admin commented on your idea: "{idea["ideaTitle"]}".'
            cursor.execute(
                'INSERT INTO notifications (user_id, idea_id, message, created_at) VALUES (%s, %s, %s, %s)',
                (submitter_id, idea_id, message, datetime.datetime.now().isoformat())
            )

        # Notify admins
        for admin in admins:
            if admin['id'] != user_id: # Don't notify the admin who is commenting
                message = f'{commenter["email"]} commented on the idea: "{idea["ideaTitle"]}".'
                cursor.execute(
                    'INSERT INTO notifications (user_id, idea_id, message, created_at) VALUES (%s, %s, %s, %s)',
                    (admin['id'], idea_id, message, datetime.datetime.now().isoformat())
                )

        db.commit()
        return jsonify({'message': 'Comment added successfully'}), 201


# --- Notification Endpoints ---

@app.route('/api/notifications/user/<int:user_id>', methods=['GET'])
@token_required
def get_notifications(user_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC',
        (user_id,)
    )
    notifications = cursor.fetchall()
    return jsonify(notifications)


@app.route('/api/notifications/mark-read', methods=['POST'])
def mark_notifications_read():
    data = request.get_json()
    notification_ids = data.get('ids', [])
    
    if not isinstance(notification_ids, list) or not notification_ids:
        return jsonify({'error': 'A list of notification IDs is required'}), 400
        
    db = get_db()
    cursor = db.cursor()
    
    placeholders = ','.join('%s' for _ in notification_ids)
    query = f'UPDATE notifications SET is_read = 1 WHERE id IN ({placeholders})'
    
    cursor.execute(query, notification_ids)
    db.commit()
    
    return jsonify({'message': f'{cursor.rowcount} notifications marked as read'}), 200


# --- Frontend Serving Routes ---

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Initialize and migrate DB on first request
    init_db()
    return send_from_directory('templates', 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5130)
