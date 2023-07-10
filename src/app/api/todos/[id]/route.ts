import { todoController } from "../../../../app/server/controller/todo";

type DeleteByIdParams = {
  params: {
    id: string;
  };
};

export async function DELETE(req: Request, params: DeleteByIdParams) {
  const { id } = params.params;

  return await todoController.deleteById(id);
}
