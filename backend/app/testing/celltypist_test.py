
import scanpy as sc
import os
import celltypist as ct
from celltypist import Model
from celltypist.classifier import AnnotationResult
from scanpy import AnnData

def read_file() -> AnnData | None:
  
  try:
    file_id = "clean_testing_file_1.h5ad"
    UPLOAD_DIR = "../../../persistent01"

    file_path = os.path.join(UPLOAD_DIR, file_id)

    adata = sc.read_h5ad(file_path)

    print(adata)

    return adata
  
  except Exception as e:
    print(e)
    return None

def prep_model() -> Model | None:
  
  try:
    # ct.models.download()
    ct.models.models_description()
    
    model = ct.models.Model.load(model = "Immune_All_Low.pkl")
    
    print(model)
    
    return model
    
  except Exception as e:
    print(e)
    return None
  
def get_annotation_predictions(object: AnnData, model: Model) -> AnnotationResult | None:
  
  try:
    preds = ct.annotate(
      filename = object,
      model = model,
      use_GPU=True
    )
    
    print(preds)
    
    return preds
    
  except Exception as e:
    print(e)
    return None
  

def main():
  
  adata = read_file()

  if (not adata):
    return None

  model = prep_model()

  if (not model):
    adata.file.close()
    return None

  preds = ct.annotate(
    filename = adata,
    model = model,
  )
  
  adata.file.close()

  return True
  # try:
    
    
    
  # except Exception as e:
  #   print(e)
  #   return None


if __name__ == "__main__":
  main()