import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Collapse,
  createFilterOptions,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, {
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { ListTextProps, theme } from "@/lib/design";
import { useAppSelector } from "@/lib/redux/hooks/hooks";
import { AutocompleteOption, statusOptions } from "@/lib/types";
import CurrentProgress from "../../OverlayCurrentProgress";

const adataAttributes: AutocompleteOption[] = [
  { label: "obs", id: 0 },
  { label: "var", id: 0 },
  { label: "obs", id: 0 },
  { label: "obs", id: 0 },
];

export default function PanelMerging(props: {
  open: boolean;
  setOpen: Function;
}) {
  
  
  const activeFile = useAppSelector((state) => state.plotReducer.system.files.active);
  const files = useAppSelector((state) => state.plotReducer.system.files.all);
  const obs = useAppSelector((state) => state.plotReducer.anndata.obs);
  
  const statusHierachy = useAppSelector((state) => state.plotReducer.status.Metadata);
  const statusObservation = useAppSelector((state) => state.plotReducer.status.Obs);
  
  const [selectedFile, setSelectedFile] = useState<AutocompleteOption | null>(null);
  const [selectedClusters, setSelectedClusters] = useState<AutocompleteOption[]>([]);
  const [fileOptions, setFileOptions] = useState<AutocompleteOption[]>([]);
  const [clusterOptions, setClusterOptions] = useState<AutocompleteOption[]>([]);
  
  
  const ref = useRef();
  const filterOptions = createFilterOptions({ limit: 20 });

  useEffect(() => {
    if (files.length > 0) {
      const newOptions = files
        .map((file, i) => ({ id: i, label: file.name } as AutocompleteOption))
        .filter((aco) => aco.label !== activeFile);
      setFileOptions(newOptions);
    }
  }, [files]);
  
  useEffect(() => {
    if (obs.indices) {
      const newOptions = obs.indices?.categories
        .map((o, i) => ({ id: i, label: o }) as AutocompleteOption);
      setClusterOptions(newOptions);
    }
  }, [obs]);
  
  console.log(files);

  return (
    <Collapse
      unmountOnExit
      ref={ref}
      in={props.open}
      orientation="horizontal"
      sx={{
        position: "absolute",
        right: 85,
        top: 0,
        height: "100%",
        zIndex: 500,
      }}
    >
      <Box
        sx={{
          width: 300,
          height: "100vh",
          p: "1vh",
          borderLeft: "1px solid grey",
          backgroundColor: theme.palette.primary.main,
          WebkitBoxShadow: "-1px 0 2px -1px #000000",
          boxShadow: "-1px 0 2px -1px #000000",
        }}
      >
        <Stack
          direction="column"
          rowGap={1.5}
          sx={{
            p: 1,
            pt: 2,
            height: "96vh",
            backgroundColor: theme.palette.background.paper,
            border: "1px solid grey",
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            disabled
            label="source file"
            InputLabelProps={{
              shrink: true,
            }}
            value={activeFile ? activeFile : "[Please wait]"}
          />

          <TextField
            variant="outlined"
            size="small"
            disabled
            label="source observation"
            InputLabelProps={{
              shrink: true,
            }}
            value={
              obs.selectedKey ? obs.selectedKey : "[select observation]"
            }
          />

          <Autocomplete
            disabled={files.length === 0}
            size="small"
            fullWidth
            value={selectedFile}
            options={fileOptions}
            isOptionEqualToValue={(option, value) =>
              (option as AutocompleteOption).id ===
              (value as AutocompleteOption).id
            }
            onChange={(event: any, value: any, reason, details) => {
              const selectedOption = details?.option as any;

              if (reason === "selectOption") {
                setSelectedFile(selectedOption);
              } else if (reason === "removeOption") {
                setSelectedFile(null);
              } else if (reason === "clear") {
                setSelectedFile(null);
              }
            }}
            filterOptions={filterOptions}
            noOptionsText="No matching file"
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  label="target file"
                  placeholder="select file"
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          <Stack direction="row" columnGap={1}>
            <Button
              variant="contained"
              fullWidth
              disabled={
                !obs.indices ||
                selectedClusters.length === obs.indices.categories.length
              }
              onClick={() => {
                if (obs.indices) {
                  setSelectedClusters(clusterOptions);
                }
              }}
              sx={{
                border: "1px solid grey",
              }}
            >
              Select all
            </Button>

            <Button
              variant="contained"
              fullWidth
              disabled={!obs.indices || selectedClusters.length === 0}
              onClick={() => {
                setSelectedClusters([]);
              }}
              sx={{
                border: "1px solid grey",
              }}
            >
              Deselect all
            </Button>
          </Stack>

          <ButtonList
            items={clusterOptions}
            selectedItems={selectedClusters}
            onClick={(item) => {
              setSelectedClusters(
                selectedClusters.includes(item)
                ? selectedClusters.filter((c) => c.id !== item.id)
                : [...selectedClusters, item]
              );
            }}
            statusIncoming={statusHierachy}
            statusOutgoing={statusObservation}
            placeholder="No observation selected"
          />

          <Button
            variant="contained"
            fullWidth
            disabled={selectedFile === null || fileOptions.length === 0}
            sx={{
              border: "1px solid grey",
            }}
          >
            Add data to target
          </Button>
          
        </Stack>
      </Box>
    </Collapse>
  );
}

function ButtonList(props: {
  items: AutocompleteOption[];
  selectedItems: AutocompleteOption[];
  statusIncoming: statusOptions;
  statusOutgoing: statusOptions;
  placeholder: string;
  onClick: (item: AutocompleteOption, elem?: MouseEvent<HTMLElement>) => void;
}) {
  const {
    items,
    selectedItems,
    statusIncoming,
    statusOutgoing,
    placeholder,
    onClick,
  } = props;

  return (
    <Stack
      direction="column"
      sx={{
        border: "1px solid grey",
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {items && !statusIncoming.inProgress ? (
        items.length > 0 ? (
          [...items]
            .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
            .map((item, i) => {
              return (
                <ButtonListItem
                  item={item}
                  selectedItems={selectedItems}
                  statusIncoming={statusIncoming}
                  statusOutgoing={statusOutgoing}
                  tabIndex={300 + i}
                  onClick={(me) => onClick(item, me)}
                />
              );
            })
        ) : (
          <Box
            sx={{
              height: "100%",
              width: "100%",
              alignContent: "center",
              justifyItems: "center",
            }}
          >
            <Typography
              sx={{
                // ...ListTextProps,
                textAlign: "center",
              }}
            >
              {placeholder}
            </Typography>
          </Box>
        )
      ) : (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            alignContent: "center",
            justifyItems: "center",
          }}
        >
          <CurrentProgress status={statusIncoming} />
        </Box>
      )}
    </Stack>
  );
}

function ButtonListItem(props: {
  item: AutocompleteOption;
  selectedItems: AutocompleteOption[];
  statusIncoming: statusOptions;
  statusOutgoing: statusOptions;
  tabIndex: number;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  const {
    item,
    selectedItems,
    statusIncoming,
    statusOutgoing,
    tabIndex,
    onClick,
  } = props;

  const isSelected = selectedItems.includes(item);

  return (
    <Tooltip title={item.label} placement="left">
      <span>
        <Button
          size="small"
          variant="text"
          tabIndex={tabIndex}
          sx={{
            ...ListTextProps,
            fontWeight: isSelected ? "bold" : "",
            backgroundColor: isSelected ? theme.palette.action.selected : "",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          onClick={(me) => onClick(me)}
        >
          <Stack
            direction="row"
            sx={{
              p: 0.3,
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                ...ListTextProps,
                fontWeight: isSelected ? "bold" : "",
                // color: isSelected ? theme.palette.action.disabled : "",
              }}
            >
              {item.label}
            </Typography>

            {statusOutgoing.inProgress && isSelected ? (
              <CircularProgress size={16} color="primary" />
            ) : (
              <></>
            )}
          </Stack>
        </Button>
      </span>
    </Tooltip>
  );
}
