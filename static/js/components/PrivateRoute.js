import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

const PrivateRoute = ({ children, allowedRoles, ...rest }) => {
    const { isLoggedIn, user, loading } = useContext(AuthContext);

    return (
        <Route
            {...rest}
            render={({ location }) => {
                if (loading) return <div>Loading...</div>; // Simple loading state for now
                if (!isLoggedIn) {
                    return <Redirect to={{ pathname: "/", state: { from: location, openLogin: true } }} />;
                }

                if (allowedRoles && !allowedRoles.includes(user?.role)) {
                    // Redirect to appropriate dashboard based on role if access denied
                    if (user.role === 'superadmin' || user.role === 'admin') return <Redirect to="/admin-dashboard" />;
                    if (user.role === 'ceo') return <Redirect to="/organization-ideas" />;
                    return <Redirect to="/submit-idea" />;
                }

                return children;
            }}
        />
    );
};

export default PrivateRoute;
