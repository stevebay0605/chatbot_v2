type User={
    username:string
}

type ChatMessage ={
    user:User,
    content:string, 
    time :number
}

export type{User, ChatMessage}