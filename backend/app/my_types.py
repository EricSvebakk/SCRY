
from pydantic import BaseModel

class newCluster(BaseModel):
  label: str
  subclusters: list[str]

class newObservation(BaseModel):
  file: str
  name: str
  base: str
  clusters: list[newCluster]