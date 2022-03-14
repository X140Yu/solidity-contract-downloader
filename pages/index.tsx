import type { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import JsZip from "jszip";
import FileSaver from "file-saver";

import { Input, Button, Loading, Container } from "@nextui-org/react";
import { ethers } from "ethers";
import { ContractData, Data } from "../types/types";

const exportZip = (contractData: ContractData) => {
  const zip = JsZip();
  contractData.files.forEach((contract, i) => {
    zip.file(
      `${contractData.name}/${contract.name}`,
      new Blob([contract.content])
    );
  });
  zip.file(`${contractData.name}/abi.json`, new Blob([contractData.abi]));
  zip.generateAsync({ type: "blob" }).then((zipFile) => {
    const fileName = `${contractData.name}.zip`;
    return FileSaver.saveAs(zipFile, fileName);
  });
};

const Home: NextPage = () => {
  const [searchAddress, setSearchAddress] = useState("");

  const [isDownloading, setIsDownloading] = useState(false);

  const downloadContract = async (address: string) => {
    setIsDownloading(true);
    try {
      const result = await fetch("/api/downloadViaAPI", {
        body: JSON.stringify({
          address: address,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const jsonData: Data = await result.json();
      if (!jsonData.data) {
        throw "Request failed, maybe it's not a verified contract address?";
      }
      exportZip(jsonData.data);
    } catch (error) {
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <title>Solidity Contract Downloader</title>
      <Container className="flex flex-col items-center max-w-xl my-auto mt-40 mb-20 overflow-y-auto">
        <h1 className="self-center text-4xl font-bold text-center text-gray-200">
          Solidity Contract Downloader
        </h1>

        <div className="items-center self-center mt-10">
          <Image
            src="/solidity.svg"
            width={100}
            height={100}
            alt="solidity-logo"
          />
        </div>

        <div className="self-center mt-4 text-center text-gray-300 text-md">
          Download verified contracts from{" "}
          <a
            href="https://etherscan.io"
            className="text-blue-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            Etherscan
          </a>{" "}
          with ease.
          <br />
          No API key required.
        </div>

        <div className="flex flex-col w-full mt-20 sm:flex-row">
          <Input
            id="input"
            width="100%"
            size="md"
            css={{ fontFamily: "monospace" }}
            spellCheck={false}
            value={searchAddress}
            placeholder="Verified Contract Address"
            onChange={(e) => {
              setSearchAddress(e.target.value);
            }}
          />
          <Button
            className="mt-4 sm:mt-0"
            auto
            // isLoading={isDownloading}
            disabled={
              searchAddress.length === 0 ||
              ethers.utils.isAddress(searchAddress) === false
            }
            onClick={async () => {
              if (searchAddress.length < 10) {
                return;
              }

              downloadContract(searchAddress);
            }}
          >
            {isDownloading ? <Loading color="white" size="sm" /> : "Download"}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-10 mt-4">
          <Button
            color="secondary"
            shadow
            size="xs"
            onClick={() => {
              setSearchAddress("0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5");
            }}
          >
            AAVE
          </Button>
          <Button
            shadow
            color="success"
            size="xs"
            onClick={() => {
              setSearchAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");
            }}
          >
            UNI
          </Button>
          <Button
            shadow
            color="warning"
            size="xs"
            onClick={() => {
              setSearchAddress("0xe65cdb6479bac1e22340e4e755fae7e509ecd06c");
            }}
          >
            Compound
          </Button>
        </div>
        <div className="fixed left-0 right-0 self-center w-screen text-sm font-light text-center text-gray-300 bottom-2">
          <a
            href="https://twitter.com/X140Yu_"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by <span className="text-indigo-400">Xinyu</span>
          </a>
        </div>
      </Container>
    </>
  );
};

export default Home;
