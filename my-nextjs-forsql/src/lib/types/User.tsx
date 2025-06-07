
export interface User {
 avatar?: string
 id: number;
 name: string;
 email: string;
 password:string;
 created_at?: Date
}

export interface CreateUserDTO {
  name:string
  email:string
  password: string
}

export interface UpdateUserDTO extends Partial<CreateUserDTO> {
  id: number
}