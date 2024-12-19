import { useUserContext } from "@/hooks/userContext";
import { Label } from "../label";


export const UserLabel = ({style,className} : {style? : React.CSSProperties,className? : string}) => {

    const {user} = useUserContext();

    return (
    <>
        <Label style={style} className={className}>
            {user ? user.username : "not logged in"}
        </Label>
    </>
    );
} 