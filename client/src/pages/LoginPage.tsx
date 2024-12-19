import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { LoginUser } from "@/services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
    username : z.string().min(1).max(50),
    password : z.string().min(1)
  });

const LoginPage = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues : {
          username : "",
          password : "",
        },
      });

    const navigate = useNavigate();

    const onSubmit : SubmitHandler<z.infer<typeof formSchema>> = async (data :z.infer<typeof formSchema>) : Promise<void> => {
        return await LoginUser(data.username,data.password).then(() => {
            toast({
                title : "Logged in",
            })
            navigate("/")
        }).catch(err => {
            toast({
                variant : "destructive",
                title : "Hiba történt a bejelentkezés közben",
                description : err,
            });
        })
    }


    return (
        <>
        <Toaster/>
        <Card>
            <CardHeader>
                <CardTitle>Bejelentkezés</CardTitle>
            </CardHeader>
            <CardContent>
                
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit,(err) => console.error(err))}>

                <FormField
                        control={form.control}
                        name="username"
                        render={({field}) => (
                            <FormItem>
                            <FormLabel>Felhasználónév</FormLabel>
                            <FormControl>
                                <Input placeholder="felhasználónév" {...field}/>
                            </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({field}) => (
                            <FormItem>
                            <FormLabel>Jelszó</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="jelszó" {...field}/>
                            </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit">
                        Belépés
                    </Button>
                </form>
        </Form>

            </CardContent>
        </Card>

        </>
    )
}

export default LoginPage