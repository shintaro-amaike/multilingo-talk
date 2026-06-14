import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post("http://localhost:8000/login/access-token", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            login(response.data.access_token);
            navigate("/");
        } catch (err) {
            setError("Login failed. Please check your credentials.");
            console.error(err);
        }
    };

    return (
        <div className="login-container" style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                        required
                    />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                        required
                    />
                </div>
                <button type="submit" style={{ padding: "0.5rem 1rem", width: "100%" }}>Login</button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default Login;
