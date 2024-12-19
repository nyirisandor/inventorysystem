import { User } from '@/types/user';
import React, { createContext, useContext } from 'react';

export const UserContext = createContext<{user : User | null, setUser: React.Dispatch<React.SetStateAction<User | null>>} | undefined>(undefined);



export const useUserContext = () =>{
    const context = useContext(UserContext);
    
    if(context === undefined){
        throw new Error("UserContext must be used within a UserContextProvider");
    }

    return context;
}