
from pydantic import BaseModel
from typing import TypedDict, Any

class newCluster(BaseModel):
  label: str
  subclusters: list[str]

class newObservation(BaseModel):
  file: str
  name: str
  base: str
  clusters: list[newCluster]
  
class BackendResponse(TypedDict):
  response: str
  ok: bool
  code: str