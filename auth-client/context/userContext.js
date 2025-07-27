import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import { toast } from "react-hot-toast";

const UserContext = React.createContext();

export const UserContextProvider = ({ children }) => {

    const serverUrl = "http://localhost:8000";

    const router = useRouter();
    const [user, setUser] = useState({});
    const [userState, setUserState] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(true);

    // register user
    const registerUser = async (e) => {
        e.preventDefault();
        if (!userState.email.includes("@") || !userState.password || userState.password.length < 6) {
            toast.error("Please enter a valid email and password(min 6 characters");
            return;
        }

        try {
            const response = await axios.post(`${serverUrl}/api/v1/register`, userState);
            console.log(response.data);
            toast.success("Registration successful!");
            setUser(response.data.user);

            // clear the form
            setUserState({
                name: "",
                email: "",
                password: "",
            });

            // redirect to login page
            router.push("/login");
        } catch (error) {
            console.error("Registration error:", error);
            // Handle error response
            toast.error(error.response?.data?.message || "Registration failed. Please try again.");
        }
    };

    // login user
    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${serverUrl}/api/v1/login`,
                {
                    email: userState.email,
                    password: userState.password,
                },
                {
                    withCredentials: true, // send cookies to the server
                }
            );
            console.log(res.data);
            toast.success("Login successful!");
            setUser(res.data.user);
            // clear the form
            setUserState({
                email: "",
                password: "",
            });
            router.push("/");
        } catch (error) {
            console.log("Error logging in user", error);
            toast.error(error.response.data.message);
        }
    }

    // dynamic form handler
    const handlerUserInput = (name) => (e) => {
        const value = e.target.value;
        setUserState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <UserContext.Provider value={{
            registerUser,
            userState,
            handlerUserInput,
            loginUser
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
}