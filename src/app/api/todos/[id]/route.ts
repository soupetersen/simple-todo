import { todoController } from "../../../../app/server/controller/todo";

type DeleteByIdParams = {
  params: {
    id: string;
  };
};

export async function PUT(req: Request, params: DeleteByIdParams) {
  const { id } = params.params;

  return todoController.deleteById(id);
}
