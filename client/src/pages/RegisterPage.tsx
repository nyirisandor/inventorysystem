import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { RegisterUser } from "@/services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { z } from "zod";

const formSchema = z.object({
    username : z.string().min(1).max(50),
    password : z.string().min(1),
    confirmpassword : z.string().min(1)
  }).refine((data) => data.password === data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmpassword"],
  });

const RegisterPage = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues : {
          username : "",
          password : "",
          confirmpassword : "",
        }
      });

    function onSubmit(values: z.infer<typeof formSchema>){
        RegisterUser(values.username,values.password).then(() => {
            toast({
                title : "Registered",
            })
        }).catch(err => {
            console.error(err);
            toast({
                variant : "destructive",
                title : "Hiba történt a regisztráció közben",
                description : err,
            })
        })
    }


    return (
        <>
        <Toaster/>
        <Card>
            <CardHeader>
                <CardTitle>Regisztráció</CardTitle>
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

                    <FormField
                        control={form.control}
                        name="confirmpassword"
                        render={({field}) => (
                            <FormItem>
                            <FormLabel>Jelszó</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="jelszó megerősítése" {...field}/>
                            </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button type="submit">
                        Regisztráció
                    </Button>
                </form>
        </Form>

            </CardContent>
        </Card>

        </>
    )
}

export default RegisterPage