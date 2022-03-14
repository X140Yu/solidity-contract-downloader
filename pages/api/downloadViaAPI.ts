// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ContractFile, Data } from "../../types/types";

const API_KEY = "IPSSKCMSEP9T6MCQWHBMBWFRSVWR4EH34Y";

export interface ResponseRoot {
  status: string;
  message: string;
  result: Result[];
}

export interface Result {
  SourceCode: string;
  ABI: string;
  ContractName: string;
  CompilerVersion: string;
  OptimizationUsed: string;
  Runs: string;
  ConstructorArguments: string;
  EVMVersion: string;
  Library: string;
  LicenseType: string;
  Proxy: string;
  Implementation: string;
  SwarmSource: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { body, method } = req;

  if (method !== "POST") {
    res.status(405);
    return;
  }

  if (!body.address) {
    res.status(400).json({ error: "You must provide an address." });
    return;
  }

  const contractAddress = body.address as string;

  console.log(process.env);

  const URL = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`;

  let response: ResponseRoot;

  try {
    const result = await fetch(URL, {
      method: "POST",
    });

    response = await result.json();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "service rate limited, please retry later" });
  }

  if (response.status !== "1") {
    return res.status(500).json({ error: response.message });
  }

  if (response.result.length < 1) {
    return res.status(404).json({ error: "No contract found" });
  }

  let files: ContractFile[] = [];

  if (response.result[0].SourceCode.startsWith("{{")) {
    files = parseFiles(response.result[0].SourceCode);
  } else {
    // single file
    files.push({
      name: response.result[0].ContractName + ".sol",
      content: response.result[0].SourceCode,
    });
  }

  const data: Data = {
    data: {
      name: response.result[0].ContractName,
      address: contractAddress,
      abi: response.result[0].ABI,
      files,
    },
  };

  return res.status(200).json(data);
}

export interface GroupedSourceCode {
  language: string;
  sources: Object;
}

interface RawSource {
  content: string;
}

const parseFiles = (code: string) => {
  let jsonRaw = code.replace(/^{/g, "").replace(/}$/g, "");
  const parsedJSON: GroupedSourceCode = JSON.parse(jsonRaw);

  console.log(Object.keys(parsedJSON.sources));

  return Object.keys(parsedJSON.sources).map((key) => {
    const content = ((parsedJSON.sources as any)[key] as RawSource).content;

    return {
      name: key,
      content,
    };
  });
};
