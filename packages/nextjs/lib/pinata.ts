"server only";

import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});

//API_KEY="ba2211a759c14ede33a9"

//API_SECRET="c9a33537c0e5a333ebeb913b86cb275f79e6684a181b999e9d1cf46047242a72"
