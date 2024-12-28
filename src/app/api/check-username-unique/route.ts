import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/Schemas/signUpSchema";


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request){


    await dbConnect()

    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result);
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [] // can also send custom error
            return Response.json({
                 success: false,
                message: "invalid query parameter"
            },{status : 400})
        }

        const {username} = result.data


        const existingVerifiedUser = await UserModel.findOne({username, isVerified: true})
        if(existingVerifiedUser){
            return Response.json({
                success: false,
               message: "username is already taken"
           },{status : 400})
        }


        return Response.json({
            success: true,
           message: "username is valid"
       },{status : 200})

        
    } catch (error) {
        console.error('Error checking user name', error);
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },{status:500}
        )
    }
}