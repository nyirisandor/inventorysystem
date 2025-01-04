import { isDeveloperMode } from "@/lib/utils";
import { User } from "@/types/user";
import axios, { AxiosError } from "axios";


const RegisterUser = async (username : string, password : string) : Promise<string> => {
    try{
        const body = {
            username : username,
            password : password
        };

        const response = await axios.post('/api/user/register',body);

        return response.data.token;

    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error during registration:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data.message);
        }
        else{
            return Promise.reject();
        }
    }
}

const LoginUser = async (username : string, password : string) : Promise<string> => {
    try{
        const body = {
            username : username,
            password : password
        };

        const response = await axios.post("/api/user/login",body)

        return response.data.token;

    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error during login:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data.message);
        }
        else{
            return Promise.reject();
        }
    }
}

const GetCurrentUser = async () : Promise<User|null> => {
    try{
        const response = await axios.get("/api/user");

        return response.data.user as User;
    }
    catch(err){
        if(isDeveloperMode())
            console.error("Error while getting current user:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

const LogoutUser = async () : Promise<void> =>{
    try{
        await axios.post("/api/user/logout");
    }    
    catch(err){
        if(isDeveloperMode())
            console.error("Error while logging out:", err);

        if(err instanceof AxiosError && err.response){
            return Promise.reject(err.response.data);
        }
        else{
            return Promise.reject();
        }
    }
}

export {RegisterUser,LoginUser,GetCurrentUser,LogoutUser};