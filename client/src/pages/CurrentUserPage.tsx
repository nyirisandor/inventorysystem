import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { UserLabel } from "@/components/ui/user/user"
import { toast } from "@/hooks/use-toast"
import { useUserContext } from "@/hooks/userContext"
import {LogoutUser } from "@/services/userService"


const CurrentUserPage = () => {
    const {setUser} = useUserContext();

    function logout(){
        LogoutUser().then(() =>{
            toast({
                title : "Kijelentkezve"
            });
            setUser(null);
            })
        .catch((err) => console.error(err));
    }

    return (
        <>
        <Toaster/>
        <Card>
            <CardTitle>Felhasználó</CardTitle>
            <CardContent>
            <UserLabel/>
            <Button onClick={logout}>Logout</Button>
            </CardContent>
        </Card>

        </>
    )
}

export default CurrentUserPage