import axios from "axios";
import { HTTP_METHODS } from "next/dist/server/web/http";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const UserContext = React.createContext();

export const UserContextProvider = ({ children }) => {

    const serverUrl = "http://localhost:8000";

    const router = useRouter();
    const [userState, setUserState] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [user, setUser] = useState(userState);

    const [loading, setLoading] = useState(false);

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

    // get user logged in status
    const userLoginStatus = async () => {
        setLoading(true);
        let loggedIn = false;
        axios.get(`${serverUrl}/api/v1/login-status`, { withCredentials: true })
            .then(res => {
                console.log("login-status res: " + res);
                if (res.status === 401) {
                    loggedIn = false;
                } else if (res.status === 200) {
                    loggedIn = true;
                    const message = res.data.message;
                    console.log("login-status message: " + message);
                }
                // loggedIn = !!res.data.message;
                if (!loggedIn) {
                    router.push("/login");
                }
            })
            .catch(error => {
                loggedIn = false;
                if (error.response && error.response.status === 401) {
                    loggedIn = false;
                }
                console.error('Error fetching data:', error)
            }).finally(() => setLoading(false));
        return loggedIn;
    };

    // logout user
    const logoutUser = async () => {
        try {
            const res = await axios.post(`${serverUrl}/api/v1/logout`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
                //     {
                //     withCredentials: true,
                // }
            );
            console.log(res.data);
            toast.success("Logout successful!");
            setUser({});
            router.push("/login");
        } catch (error) {
            console.log("Error logging out user", error);
            toast.error(error.response.data.message);
        }
    }

    // get the user
    const getUser = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/v1/user`, {
                withCredentials: true,
            });
            console.log(`user: ${JSON.stringify(res)}`);
            if (res.status === 200) {
                setUser((prevState) => {
                    return {
                        ...prevState,
                        ...res.data,
                    };
                });
            } else {
                setUser({});
                router.push("/login");
            }
        } catch (error) {
            console.log("Error getting user details", error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        const loginStatusGetUser = async () => {
            const isLoggedIN = await userLoginStatus();
            if (isLoggedIN) {
                await getUser();
            }
        };
        loginStatusGetUser();
    }, []);

    return (
        <UserContext.Provider value={{
            registerUser,
            userState,
            handlerUserInput,
            loginUser,
            logoutUser,
            userLoginStatus,
            user
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
}