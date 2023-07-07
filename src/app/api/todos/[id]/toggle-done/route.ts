import { todoController } from "../../../../server/controller/todo";

type ToggleDone = {
  params: {
    id: string;
  };
};

export async function PUT(req: Request, params: ToggleDone) {
  const { id } = params.params;

  console.log("id", id);

  return await todoController.toggleDone(req, id);
}
