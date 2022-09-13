import "reflect-metadata";

import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });
    
    it("Should be able to create an user", async () => {
        const user = await createUserUseCase.execute({
            name: "UserTest",
            email: "test@test.com",
            password: "12345"
        });
        expect(user).toHaveProperty("id");
    });
});