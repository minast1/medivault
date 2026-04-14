import { NextResponse } from "next/server";
import { pinata } from "~~/lib/pinata";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // If you're going to use auth you'll want to verify here
  try {
    const { name } = await request.json();
    // Validate that 'name' is a string and not empty
    if (!name || typeof name !== "string") {
      return Response.json({ error: "Group name is required" }, { status: 400 });
    }

    let groupId;
    const groupsResponse = await pinata.groups.public.list().name(name);
    if (groupsResponse.groups && groupsResponse.groups.length > 0) {
      groupId = groupsResponse.groups[0].id;
    } else {
      console.log(name);
      const newGroup = await pinata.groups.public.create({
        name: name.toLowerCase().trim(),
        isPublic: true,
      });
      groupId = newGroup.id;
    }

    const url = await pinata.upload.public.createSignedURL({
      expires: 30, // The only required param
    });
    return NextResponse.json({ url: url, groupId }, { status: 200 }); // Returns the signed upload URL
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { text: "Error creating API Key:", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
