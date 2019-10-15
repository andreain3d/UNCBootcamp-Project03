import React from "react";
import { Button, TextField, Input } from "@material-ui/core";
import { Cancel } from "@material-ui/icons";
const EditImage = ({
  useHyper,
  image,
  imgURL,
  handleInputChange,
  saveImgUrl,
  toggleImageInputType,
  cancelImageEdit,
  upload,
  handleUploadChange
}) => {
  if (useHyper) {
    return (
      <div>
        <TextField
          id="standard-name"
          label="Image Url"
          name="imgURL"
          defaultValue={image}
          value={imgURL}
          onChange={handleInputChange}
          margin="normal"
        />
        <Button variant="outline" onClick={saveImgUrl} color="primary">
          Save
        </Button>
        <Button
          variant="outline"
          onClick={toggleImageInputType}
          color="secondary"
        >
          Upload A Photo
        </Button>
        <Cancel onClick={cancelImageEdit} />
      </div>
    );
  } else {
    return (
      <div>
        <Input
          value={upload}
          type="file"
          name="upload"
          accept="image/*"
          onChange={handleUploadChange}
        />
        <Button variant="outline" onClick={upload} color="primary">
          Upload
        </Button>
        <Button
          variant="outline"
          onClick={toggleImageInputType}
          color="secondary"
        >
          Use An Image Link
        </Button>
        <Cancel onClick={cancelImageEdit} />
      </div>
    );
  }
};

export default EditImage;
