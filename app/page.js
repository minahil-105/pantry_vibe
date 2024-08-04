"use client";
import "@fontsource/pacifico";
import { CameraAlt, Delete, Edit, Search } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  GlobalStyles,
  Grid,
  IconButton,
  Modal,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
import Auth from "./auth";
import { auth, db, storage } from "./firebaseConfig";

// Styled components for better UI design
const Root = styled(Box)({
  backgroundColor: "#eddcd9",
  padding: "20px",
  minHeight: "100vh",
});

const Title = styled(Typography)({
  fontFamily: "'Pacifico', cursive",
  color: "#3f51b5",
  marginBottom: "20px",
});

const CustomTextField = styled(TextField)({
  fontFamily: "'Pacifico', cursive",
  marginRight: "10px",
  marginBottom: "10px",
});

const AddButton = styled(Button)({
  backgroundColor: "#3f51b5",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#303f9f",
  },
});
//chnged  or not
const ListItem = styled("li")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px",
  backgroundColor: "#FFFBF5",
  borderRadius: "4px",
  marginBottom: "10px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
});

const CustomIconButton = styled(IconButton)({
  color: "#9C27B0",
});

const UpdateButton = styled(Button)({
  backgroundColor: "#3f51b5",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#303f9f",
  },
});

const Header = styled(AppBar)({
  fontFamily: "'Pacifico', cursive",
  marginBottom: "20px",
  backgroundColor: "#694F8E",
});

const HeaderTitle = styled(Typography)({
  fontFamily: "'Pacifico', cursive",
  color: "#fff",
  flexGrow: 1,
});

const Footer = styled(Box)({
  marginTop: "20px",
  padding: "10px",
  backgroundColor: "#694F8E",
  color: "#fff",
  textAlign: "center",
});

const Home = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    expirationDate: "",
    image: "",
    label: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const webcamRef = useRef(null);
  const [user, setUser] = useState(null);
  // Fetch items from Firestore on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(
          collection(db, "pantryItems"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPantryItems(items);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    if (user) {
      fetchItems();
    }
  }, [user]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  // Function to handle adding a new item
  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.quantity.trim()) {
      alert("Name and Quantity are required!");
      return;
    }
    const loading = toast.loading("Adding item....");
    try {
      let imageUrl = "";
      let labels = [];
      if (newItem.image) {
        // Upload image to Firebase Storage and get the download URL
        const imageRef = ref(storage, `images/${Date.now()}`);
        await uploadString(imageRef, newItem.image, "data_url");
        imageUrl = await getDownloadURL(imageRef);

        // Send image URL to server for analysis
        const response = await fetch("/api/analyzeImage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
        if (!response.ok) {
          console.error("Error in image analysis request:", response);
          throw new Error("Image analysis failed");
        }
        labels = await response.json(); // Log all labels to console
      }

      // Add item to Firestore with the first label and image URL
      const docRef = await addDoc(collection(db, "pantryItems"), {
        name: newItem.name,
        quantity: newItem.quantity,
        expirationDate: newItem.expirationDate,
        image: imageUrl,
        label: labels[0] || "", // Display only the first label
        uid: user.uid,
      });

      setPantryItems([
        ...pantryItems,
        { id: docRef.id, ...newItem, image: imageUrl, label: labels[0] || "" },
      ]);
      setNewItem({
        name: "",
        quantity: "",
        expirationDate: "",
        image: "",
        label: "",
      });
      toast.dismiss(loading);
      toast.success("Item Added Successfully!");
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error.message);
    }
  };

  // Function to handle deleting an item
  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "pantryItems", id));
      setPantryItems(pantryItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Function to handle editing an item
  const handleEditItem = (item) => {
    setEditMode(true);
    setEditedItem(item);
  };

  // Function to handle updating an item
  const handleUpdateItem = async () => {
    try {
      const docRef = doc(db, "pantryItems", editedItem.id);
      await updateDoc(docRef, editedItem);

      const updatedItems = pantryItems.map((item) => {
        if (item.id === editedItem.id) {
          return { ...item, ...editedItem };
        }
        return item;
      });

      setPantryItems(updatedItems);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  // Function to capture image from webcam
  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setNewItem({ ...newItem, image: imageSrc });
    setCameraOpen(false);
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No Expiration Date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return format(date, "MM/dd/yyyy");
  };
  // Function to fetch recipes based on pantry items
  const handleFetchRecipes = async () => {
    try {
      const labels = pantryItems.flatMap((item) => item.name).filter(Boolean);
      const response = await fetch("/api/getRecipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labels }),
      });

      if (!response.ok) {
        console.error("Error in fetching recipes request:", response);
        throw new Error("Fetching recipes failed");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  // Filter items based on search term
  const filteredItems = pantryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.expirationDate.includes(searchTerm.toLowerCase())
  );

  return (
    <Auth>
      <Box>
        <CssBaseline />
        <GlobalStyles styles={{ body: { backgroundColor: "#BB9AB1" } }} />
        <Header position="static">
          <Toolbar>
            <Typography
              variant="h5"
              noWrap
              style={{
                fontFamily: "'Pacifico', cursive",
                color: "#EDDCD9",
                paddingBottom: 10,
              }}
            >
              Pantry Vibe
            </Typography>
            <Typography
              variant="subtitle1"
              noWrap
              style={{ marginLeft: "20px" }}
            >
              Keep track of your pantry items effortlessly
            </Typography>
          </Toolbar>
        </Header>
        <Container>
          <Root>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Title variant="h4">Pantry Items</Title>
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  label="Search items"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton>
                        <Search />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  label="Item Name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
                <CustomTextField
                  label="Quantity"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                />
                <CustomTextField
                  label="Expiration Date"
                  type="date"
                  value={newItem.expirationDate}
                  onChange={(e) =>
                    setNewItem({ ...newItem, expirationDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CameraAlt />}
                  onClick={() => setCameraOpen(true)}
                >
                  Capture Image
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddItem}
                  style={{ marginLeft: "10px" }}
                >
                  Add Item
                </Button>
              </Grid>
              {editMode && (
                <Grid item xs={12}>
                  <CustomTextField
                    label="Edit Item Name"
                    value={editedItem.name}
                    onChange={(e) =>
                      setEditedItem({ ...editedItem, name: e.target.value })
                    }
                  />
                  <CustomTextField
                    label="Edit Quantity"
                    value={editedItem.quantity}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
                        quantity: e.target.value,
                      })
                    }
                  />
                  <CustomTextField
                    label="Edit Expiration Date"
                    type="date"
                    value={editedItem.expirationDate}
                    onChange={(e) =>
                      setEditedItem({
                        ...editedItem,
                        expirationDate: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <UpdateButton onClick={handleUpdateItem}>
                    Update Item
                  </UpdateButton>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleFetchRecipes}
                >
                  Fetch Recipes
                </Button>
                {recipes.length > 0 && (
                  <Box>
                    <Typography variant="h6">Recipes:</Typography>
                    <ul>
                      {recipes.map((recipe) => (
                        <li key={recipe.id}>
                          <Typography variant="body1">
                            {recipe.title}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <ul>
                  {filteredItems.map((item) => (
                    <ListItem key={item.id}>
                      <Typography variant="body1">
                        {item.name} - {item.quantity} -{" "}
                        {formatDate(item.expirationDate)}
                      </Typography>
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={100}
                          height={100}
                          style={{ marginLeft: "10px", borderRadius: "4px" }}
                        />
                      )}
                      <div>
                        <CustomIconButton onClick={() => handleEditItem(item)}>
                          <Edit />
                        </CustomIconButton>
                        <CustomIconButton
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Delete />
                        </CustomIconButton>
                      </div>
                    </ListItem>
                  ))}
                </ul>
              </Grid>
            </Grid>
            <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  bgcolor: "background.paper",
                  border: "2px solid #000",
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCapture}
                  style={{ marginTop: "10px" }}
                >
                  Capture
                </Button>
              </Box>
            </Modal>
          </Root>
        </Container>
        <Footer>
          <Typography variant="body1">© 2024 Pantry Manager</Typography>
        </Footer>
      </Box>
    </Auth>
  );
};

export default Home;
