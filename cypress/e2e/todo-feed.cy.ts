const BASE_URL = "http://localhost:3000";

describe("/ - todo feed", () => {
  it("when load render todo page", () => {
    cy.visit(BASE_URL);
  });

  it("when create a new todo, it must appears in the screen", () => {
    cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
      request.reply({
        statusCode: 201,
        body: {
          todo: {
            id: "70905d7e-c969-45b1-99f0-1aa155477204",
            date: "2022-09-25T15:00:00.000Z",
            content: "Test todo",
            done: false,
          },
        },
      });
    }).as("createTodo");

    cy.visit(BASE_URL);

    cy.get("input[name='add-todo']").type("Test todo");

    cy.get("[aria-label='Adicionar novo item']").click();

    cy.get("table > tbody").contains("Test todo");

    expect("texto").to.be.equal("texto");
  });
});
