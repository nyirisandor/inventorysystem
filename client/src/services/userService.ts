import { User } from "@/types/user";


const RegisterUser = async (username : string, password : string) : Promise<string> => {
    try{
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const body = {
            username : username,
            password : password
        };

        const response = await fetch("/api/user/register",{
            headers : headers,
            method: 'post',

            body : JSON.stringify(body)
        });

        const json = await response.json();

        if(response.status != 201){
            return Promise.reject(json.message);
        }

        return json.token;

    }
    catch(err){
        console.error("Register error:", err);
        return Promise.reject();
    }
}

const LoginUser = async (username : string, password : string) : Promise<string> => {
    try{
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const body = {
            username : username,
            password : password
        };

        const response = await fetch("/api/user/login",{
            headers : headers,
            method: 'post',

            body : JSON.stringify(body)
        });

        const json = await response.json();


        if(response.status != 200){
            return Promise.reject(json.message);
        }

        return json.token;

    }
    catch(err){
        console.error("Login error:", err);
        return Promise.reject();
    }
}

const GetCurrentUser = async () : Promise<User|null> => {
    try{
        const response = await fetch("/api/user",{
            method: 'get',
            credentials : "same-origin"
        });

        const json = await response.json();

        if(response.status == 401){
            return null
        }

        if(response.status != 200){
            return Promise.reject(json.message);
        }

        return json.user as User;

    }
    catch(err){
        console.error("Login error:", err);
        return Promise.reject();
    }
}

const LogoutUser = async () : Promise<void> =>{

    const response = await fetch("/api/user/logout",{
        method: 'post'
    });

    if(response.status != 200){
        return Promise.reject(response.body)
    }

    return Promise.resolve();

}

export {RegisterUser,LoginUser,GetCurrentUser,LogoutUser};