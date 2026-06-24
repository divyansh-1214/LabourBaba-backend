import prisma from "../config/prisma";
import { CreateCustomerReq } from "../type/api_req.type"
import { Customer } from "../type/api_res.types"


export const getAll = async (): Promise<Customer[]> => {
  const clients = await prisma.customer.findMany();
  return clients;
}
export const customerService = async (data: CreateCustomerReq): Promise<Customer> => {
  return prisma.customer.create({ data })
}
