import React, { useState, useRef, useEffect } from "react";
import styles from "./TopSection.module.css";
import StaunchLogo from '../../Images/StaunchLogo.png';
import ProfilePhoto from '../../Images/ProfilePhoto.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { LuCircleUserRound } from "react-icons/lu";
import { IoMdNotificationsOutline } from "react-icons/io";
import { RiListSettingsFill } from "react-icons/ri";
import { faTimes, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { PiSignOutBold } from "react-icons/pi";

// Sample Data (Replace with your actual user data source)
const defaultProfilePhoto = ProfilePhoto;
const userProfileData = {
    name: "Software",
    email: "software@staunchtec.com",
    userId: "STC - 00001",
};

const SlidingContainer = ({ isOpen, onClose, children }) => {
    const containerRef = useRef(null);

    return (
        <div
            className={`${styles.slidingContainer} ${
                isOpen ? styles.slidingContainerOpen : ""
            }`}
            ref={containerRef}
        >
            <button className={styles.closeButton} onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
            {children}
        </div>
    );
};

const TopSection = () => {
    const [showAddOptions, setShowAddOptions] = useState(false);
    const addOptionsRef = useRef(null);
    const [activeContainer, setActiveContainer] = useState(null);
    const [userProfile, setUserProfile] = useState({
        ...userProfileData,
        profilePhoto: defaultProfilePhoto,
    });
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const photoOptionsRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleAddButtonClick = () => {
        setShowAddOptions((prev) => !prev);
    };

    const handleIconClick = (containerName) => {
        setActiveContainer(containerName);
    };

    const handleCloseContainer = () => {
        setActiveContainer(null);
    };

    const handleSignOut = () => {
        // Add your sign-out logic here (e.g., clearing cookies, redirecting)
        console.log("Signing out...");
        setActiveContainer(null); // Close the profile container after sign-out
    };

    const handleProfilePhotoClick = () => {
        setShowPhotoOptions((prev) => !prev);
    };

    const handleChangeProfilePhoto = () => {
        fileInputRef.current.click(); // Programmatically trigger file input
        setShowPhotoOptions(false);
    };

    const handleDeleteProfilePhoto = () => {
        setUserProfile((prev) => ({ ...prev, profilePhoto: defaultProfilePhoto }));
        setShowPhotoOptions(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserProfile((prev) => ({ ...prev, profilePhoto: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const handleClickOutsideAddOptions = (event) => {
            if (
                showAddOptions &&
                addOptionsRef.current &&
                !addOptionsRef.current.contains(event.target)
            ) {
                setShowAddOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutsideAddOptions);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideAddOptions);
        };
    }, [showAddOptions]);

    useEffect(() => {
        const handleClickOutsidePhotoOptions = (event) => {
            if (
                showPhotoOptions &&
                photoOptionsRef.current &&
                !photoOptionsRef.current.contains(event.target)
            ) {
                setShowPhotoOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutsidePhotoOptions);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsidePhotoOptions);
        };
    }, [showPhotoOptions]);

    const IconWithTooltip = ({ children, tooltip }) => (
        <div className={styles.iconWrapper}>
            {children}
            <span className={`${styles.tooltip} ${styles.tooltipTop}`}>{tooltip}</span>
        </div>
    );

    return (
        <div className={styles.topSection}>
            <div className={styles.searchBar}>
                <input type="text" placeholder="Search " />
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            </div>

            <div className={styles.topSectionIcons}>
                <button
                    className={styles.topSectionButton}
                    onClick={handleAddButtonClick}
                >
                    <FontAwesomeIcon
                        icon={faPlus}
                        className={styles.topSectionButtonicon}
                    />
                    Add New
                </button>
                {showAddOptions && (
                    <div className={styles.addOptions} ref={addOptionsRef}>
                        <button className={styles.addOptionButton}>
                            Add Employee
                        </button>
                        <button className={styles.addOptionButton}>
                            Add Department
                        </button>
                        <button className={styles.addOptionButton}>
                            Add Designation
                        </button>
                        <button className={styles.addOptionButton}>
                            Add Work Location
                        </button>
                    </div>
                )}

                <div onClick={() => handleIconClick("notifications")}>
                    <IconWithTooltip tooltip="Notifications">
                        <IoMdNotificationsOutline className={styles.icon} />
                    </IconWithTooltip>
                </div>
                <div onClick={() => handleIconClick("settings")}>
                    <IconWithTooltip tooltip="Settings">
                        <RiListSettingsFill className={styles.icon} />
                    </IconWithTooltip>
                </div>
                <div
                    className={styles.profileIcon}
                    onClick={() => handleIconClick("profile")}
                >
                    <IconWithTooltip tooltip="Profile">
                        <LuCircleUserRound className={styles.icon} />
                    </IconWithTooltip>
                </div>
            </div>

            {activeContainer === "notifications" && (
                <SlidingContainer
                    isOpen={activeContainer === "notifications"}
                    onClose={handleCloseContainer}
                >
                    <h2>No Notification</h2>
                    {/* <p>This is where notifications will be displayed.</p> */}
                </SlidingContainer>
            )}
            {activeContainer === "settings" && (
                <SlidingContainer
                    isOpen={activeContainer === "settings"}
                    onClose={handleCloseContainer}
                >
                    <h2>Settings</h2>
                    <p>This is where settings options will be displayed.</p>
                </SlidingContainer>
            )}
            {activeContainer === "profile" && (
                <SlidingContainer
                    isOpen={activeContainer === "profile"}
                    onClose={handleCloseContainer}
                >
                    <div className={styles.profileContainer}>
                        <img
                            src={userProfile.profilePhoto}
                            alt="Profile"
                            className={styles.profilePhoto}
                            onClick={handleProfilePhotoClick}
                        />

                        {showPhotoOptions && (
                            <div className={styles.photoOptions} ref={photoOptionsRef}>
                                <button onClick={handleChangeProfilePhoto}>Change Photo</button>
                                <button onClick={handleDeleteProfilePhoto}>Delete Photo</button>
                            </div>
                        )}

                        <h2 className={styles.profileName}>{userProfile.name}</h2>
                        <p className={styles.profileInfo}>
                            Email: {userProfile.email}
                        </p>
                        <p className={styles.profileInfo}>
                            User ID: {userProfile.userId}
                        </p>
                        <button className={styles.signOutButton} onClick={handleSignOut}>
                            <PiSignOutBold className={styles.signOutIcon} />
                            Sign Out
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            ref={fileInputRef}
                        />
                    </div>
                </SlidingContainer>
            )}
        </div>
    );
};

export default TopSection;