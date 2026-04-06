import { pinata } from "~~/lib/pinata";

export async function uploadToIPFS(file: File, groupName: string): Promise<string> {
  let groupId;
  const groups = await pinata.groups.public.list().name(groupName);
  if (groups.groups.length > 0) {
    groupId = groups.groups[0].id;
  } else {
    const newGroup = await pinata.groups.public.create({
      name: groupName,
      isPublic: true,
    });
    groupId = newGroup.id;
  }
  console.log({ groupId });
  const urlRequest = await fetch("/api/ipfs");
  console.log({ urlRequest });
  const urlResponse = await urlRequest.json();

  try {
    const upload = await pinata.upload.public.file(file).url(urlResponse.url).group(groupId);
    return upload.cid;
  } catch (error) {
    console.log(error);
    return "";
  }
}
