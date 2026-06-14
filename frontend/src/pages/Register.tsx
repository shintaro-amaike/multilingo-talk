import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/register", null, {
                params: { username, password, email },
            });
            navigate("/login");
        } catch (err) {
            setError("Registration failed. Username might be taken.");
            console.error(err);
        }
    };

    return (
        <div className="register-container" style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
            <h2>Register</h2>
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
                    <label>Email (Optional)</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
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
                <button type="submit" style={{ padding: "0.5rem 1rem", width: "100%" }}>Register</button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;
