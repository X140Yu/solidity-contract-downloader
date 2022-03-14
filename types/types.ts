export interface ContractFile {
  name: string;
  content: string;
}

export interface ContractData {
  address: string;
  name: string;
  abi: string;
  files: ContractFile[];
}

export type Data = {
  data?: ContractData;
  error?: string;
};
