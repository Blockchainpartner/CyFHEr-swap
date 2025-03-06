import React from "react";

function Presentation() {
  return (
    <div className="flex flex-col items-center justify-center md:w-1/2 p-5 space-y-6 text-white">
      <h1 className="md:text-6xl text-3xl text-center  font-bold">
        CyFHEr Swap{" "}
      </h1>
      <p className=" text-xl text-center md:text-2xl">
        The private Dex powered by FHE
      </p>
      <p className="text-m md:text-xl text-center">
        CyFHEr Swap is a Dex that allows you to swap cryptos with complete
        confidentiality, leveraging Fully Homomorphic Encryption (FHE)
        technology. By keeping transaction details encrypted at all times,
        CyFHEr Swap ensures your privacy is protected while offering a seamless
        and secure DeFi experience.
      </p>
    </div>
  );
}

export default Presentation;
