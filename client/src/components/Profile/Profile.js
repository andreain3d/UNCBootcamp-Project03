import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Grid,
  TextField,
  IconButton,
  Tooltip
} from "@material-ui/core";
import { Edit, Cancel } from "@material-ui/icons";
import API from "../../utils/API";
import axios from "axios";
import EditImage from "../editImage";

const buttonStyle = {
  marginBottom: 25
};

class Profile extends React.Component {
  state = {
    loading: true,
    editImg: false,
    editName: false,
    imgURL: "",
    useHyper: false,
    upload: "",
    file: null,
    newName: ""
  };

  componentDidMount() {
    //fetch user data from the dB
    const { email } = this.props;
    API.getUser(email)
      .then(res => {
        const { username, image, cash } = res.data;
        this.setState({ username, image, cash, loading: false });
        this.props.setUserNameAndCash(username, cash);
      })
      .catch(err => {
        console.log(err);
      });
  }

  addCash = () => {
    API.getUser(this.props.email).then(res => {
      API.updateUser(res.data.email, {
        cash: res.data.cash + 1000
      }).then(
        this.props.setUserNameAndCash(res.data.username, res.data.cash + 1000)
      );
    });
  };

  toggleImageEdit = () => {
    this.setState({ editImg: !this.state.editImg });
  };

  toggleNameEdit = () => {
    this.setState({ editName: !this.state.editName });
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  saveImgUrl = () => {
    API.updateUser(this.props.email, {
      image: this.state.imgURL
    });
    this.setState({ image: this.state.imgURL, imgURL: "", editImg: false });
  };

  toggleImageInputType = () => {
    this.setState({ useHyper: !this.state.useHyper });
  };

  handleUploadChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value, file: event.target.files[0] });
  };

  upload = () => {
    var formData = new FormData();
    formData.append("avatar", this.state.file);
    const config = {
      headers: {
        "content-type": "multipart/form/data"
      }
    };

    axios
      .post("/api/users/upload", formData, config)
      .then(res => {
        API.updateUser(this.props.email, {
          image: res.data.rel
        });
        this.setState({ image: res.data.rel, editImg: false });
      })
      .catch(err => console.log(err));
  };

  handleNameUpdate = () => {
    API.updateUser(this.props.email, {
      username: this.state.newName
    }).then(res => {
      this.props.setUserNameAndCash(this.state.newName, res.data.cash);
    });
    this.setState({ username: this.state.newName, editName: false });
  };

  cancelImageEdit = () => {
    this.setState({ useHyper: true, editImg: false, imgURL: "" });
  };

  cancelNameEdit = () => {
    this.setState({ editName: false, newName: "" });
  };

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }

    return (
      <Grid container justify="center" alignItems="center">
        <Grid item xs={12}>
          <Grid container justify="center" alignItems="flex-end">
            <img
              src={this.state.image}
              alt="Profile"
              style={{ width: "200px", height: "200px" }}
            />
            {this.state.editImg ? null : (
              <Fragment>
                <Tooltip title="Edit Image" placement="right">
                  <Edit color="secondary" onClick={this.toggleImageEdit} />
                </Tooltip>
              </Fragment>
            )}
          </Grid>
          <Grid container justify="center" alignItems="center">
            {this.state.editImg ? (
              <EditImage
                useHyper={this.state.useHyper}
                image={this.state.image}
                imgURL={this.state.imgURL}
                handleInputChange={this.handleInputChange}
                saveImgUrl={this.saveImgUrl}
                toggleImageInputType={this.toggleImageInputType}
                cancelImageEdit={this.cancelImageEdit}
                upload={this.state.upload}
                handleUploadChange={this.handleUploadChange}
              />
            ) : null}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center" alignItems="flex-end">
            {this.state.editName ? (
              <TextField
                id="standard-name"
                label="Name"
                name="newName"
                value={this.state.newName}
                defaultValue={this.state.username}
                onChange={this.handleInputChange}
                margin="normal"
              />
            ) : (
              <Fragment>
                <h2>
                  {this.state.username}
                  <Tooltip title="Edit Name" placement="right">
                    <Edit color="secondary" onClick={this.toggleNameEdit} />
                  </Tooltip>
                </h2>
              </Fragment>
            )}
          </Grid>
          <Grid container justify="center" alignItems="center">
            {this.state.editName ? (
              <div>
                <Button
                  variant="outlined"
                  onClick={this.handleNameUpdate}
                  color="primary"
                >
                  Save
                </Button>
                <Cancel onClick={this.cancelNameEdit} />
              </div>
            ) : null}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center">
            <p>{this.props.email}</p>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Button
              variant="contained"
              color="primary"
              style={buttonStyle}
              onClick={this.addCash}
            >
              Add $1000 to Account
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Link to="/">
              <Button variant="contained" color="secondary">
                Back
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default Profile;
