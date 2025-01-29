
"use client"

import { RootState } from "@/lib/redux/stores/store";

import { 
  useParams,
  // useRouter,
 } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

async function fetchFile(fileID: string) {
  
  const endpoint = `http://localhost:8020/`;
  const request = `get_file_hierarchy?file_id=${fileID}`;
  
  fetch(`${endpoint}${request}`)
  .then((response) => {
    if (!response.ok) {
      console.error("something fucky happened")
    }
    
    return response.json();
  })
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("something fucky", error);
  })
  
  // return data;
}

export default function FileIdPage({ }) {
  
  const { fileID } = useParams();
  
  useEffect(() => {
    
    if (typeof fileID === "string") {
      fetchFile(fileID);
    }
    
  }, [])
  
  console.log(fileID);
  
  const files = useSelector((state: RootState) => state.fileReducer.files);
  
  console.log(files);
  
  
  return <p>Post: { fileID }</p>;
  
}