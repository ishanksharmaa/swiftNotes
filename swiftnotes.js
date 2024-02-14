const plusBtn = document.getElementById("plus-btn"),
    addBox = document.querySelector(".add-box"),
    popupBg = document.querySelector(".popup-bg"),
    popupBox = document.querySelector(".popup-box"),
    popupTitle = popupBg.querySelector("header p"),
    closeIcon = popupBg.querySelector("header i"),
    titleTag = popupBg.querySelector("input"),
    descTag = popupBg.querySelector("textarea"),
    addBtn = popupBg.querySelector("button"),
    firstLi = document.querySelector(".tab-list li:first-child");
navigation = document.querySelector(".navigation");

const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
const notes = JSON.parse(localStorage.getItem("notes") || "[]");
let isUpdate = false, updateId;


// Capitalize only first letter of note
// function capitalizeFirstLetter(input) {
//     input.value = input.value.charAt(0).toUpperCase() + input.value.slice(1).toLowerCase();
// }

// OPEN POPUP BOX
plusBtn.addEventListener("click", () => {
    popupTitle.innerText = "Add a new Note";
    addBtn.innerText = "Add Note";
    popupBg.classList.add("show");
    plusBtn.style.display = 'none';
    document.querySelector("body").style.overflow = "hidden";
    if (window.innerWidth > 660) descTag.focus();
});
// CLOSE POPUP BOX
document.addEventListener('DOMContentLoaded', function () {

    closeIcon.addEventListener('click', closePopup);
    document.body.addEventListener('click', function (event) {
        if (popupBg.classList.contains('show') && !popupBox.contains(event.target) && !plusBtn.contains(event.target)) {
            addBtn.click();     //this already contains closePopup();
        }
    });
});
function closePopup() {
    isUpdate = false;
    titleTag.value = descTag.value = "";
    popupBg.classList.remove("show");
    plusBtn.style.display = 'block';
    document.querySelector("body").style.overflow = "auto";
}

// Note (html)
function showNotes() {
    if (!notes) return;
    document.querySelectorAll(".note").forEach(li => li.remove());
    notes.forEach((note, id) => {
        // if (!note.classList.contains('social-note')) {
        let filterDesc = note.description.replaceAll("\n", '<br/>');
        let liTag = `<li id="note-${id}" class="note ${note.pinned ? 'pinned' : ''}">
                        <i class="bi-pin pin-icon"></i>
                        <div class="details">
                        <p>${note.title}</p>
                        <span>${filterDesc}</span>
                        </div>
                        <div class="bottom-content">
                        <span>${note.date}</span>
                        <i class="fa-regular fa-star star-icon"></i>
                            <div class="settings">
                            <i onclick="openNoteMenu(this)" class="uil uil-ellipsis-h"></i>
                            <ul class="menu">
                            <li onclick="updateNote(${id}, '${note.title}', '${filterDesc}')"><i class="uil uil-pen"></i>Edit</li>
                            <li onclick="archiveNote(${id})" class="archive-btn"><i class="uil uil-archive"></i>Archive</li>
                            <li onclick="deleteNote(${id})" id="delete"><i class="uil uil-trash"></i>Delete</li>
                            </ul>
                            </div>
                            </div>
                            </li>`;
        addBox.insertAdjacentHTML("afterend", liTag);
        // }
    });
}
showNotes();

function archiveNote(noteId) {
    const note = document.getElementById(`note-${noteId}`);
    note.classList.toggle('archived');
    const archiveOption = note.classList.contains('archived') ? "Unarchive" : "Archive";
    const archiveButton = note.querySelector('.archive-btn');
    if (archiveButton) {
        archiveButton.innerHTML = `<i class="uil uil-archive"></i>${archiveOption}`;
    }
    const allTabClickedState = document.querySelector('.allnotes-tab .clickedState');
    if (allTabClickedState) {
        archiveTab.click();
        allNotesTab.click();
    }
    const noteArchives = document.querySelectorAll('.note .archived');
    const emptyArchive = noteArchives.length === 0;
    if (emptyArchive) {
        allNotesTab.click();
    } else {
        const allArchived = Array.from(noteArchives).every(note => note.classList.contains('archived'));
        if (allArchived) {
            archiveTab.click();
        } else {
            allNotesTab.click();
        }
    }
    storeNoteStatus();
}

function openNoteMenu(elem) {
    elem.parentElement.classList.add("show");
    document.addEventListener("click", e => {
        if (e.target.tagName != "I" || e.target != elem) {
            elem.parentElement.classList.remove("show");
        }
    });
}


let deleteAfterUnpin = (noteId) => {
    notes.splice(noteId, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
    location.reload();
};
function deleteNote(noteId) {
    let confirmDel = confirm("Are you sure you want to delete this note? ");
    // let confirmDel = confirm("This note will be deleted. \n Any previously marked notes will be unmarked, and the note before that one will be marked.");
    if (!confirmDel) return;

    resetNoteStatus(noteId);
}

function resetNoteStatus(noteId) {
    const note = document.getElementById(`note-${noteId}`);
    const isPinned = note.classList.contains('pinned');
    const isStarred = note.classList.contains('starred');

    if (isPinned) {
        const pinIcon = document.querySelector(`#note-${noteId} .pin-icon`);
        pinIcon.click()
        deleteAfterUnpin(noteId);
    }
    else {
        deleteAfterUnpin(noteId);
    }
    if (isStarred) {
        const starIcon = document.querySelector(`#note-${noteId} .star-icon`);
        starIcon.click();
        deleteAfterUnpin(noteId);
    }
}


// DO NOT CHANGE THE LINE POSITIONS
function updateNote(noteId, title, filterDesc) {
    let description = filterDesc.replaceAll('<br/>', '\r\n');
    updateId = noteId;
    isUpdate = true;
    // Delay in open-popupBox
    setTimeout(() => {
        plusBtn.click();
        popupTitle.innerHTML = "Update a Note";
        addBtn.innerHTML = "Update Note";
        titleTag.value = title;
        descTag.value = description;
    }, 100);
    // location.reload();
}


//Add Note btn
addBtn.addEventListener("click", e => {
    e.preventDefault();
    let title = titleTag.value.trim(),
        description = descTag.value.trim();

    if (title || description) {
        let currentDate = new Date(),
            month = months[currentDate.getMonth()],
            day = currentDate.getDate(),
            year = currentDate.getFullYear();

        let noteInfo = { title, description, date: `${month} ${day}, ${year}` };

        if (!isUpdate) {
            // Add new note
            notes.push(noteInfo);
        } else {
            // Update existing note
            notes[updateId] = noteInfo;
            isUpdate = false; // Reset update flag after updating
        }

        localStorage.setItem("notes", JSON.stringify(notes));
        showNotes();
        closePopup(); // Close the popup after adding/updating note
        location.reload();
    }
});


// PROFILE ACCOUNT POPUP
const profile = document.getElementById('profile');
const profileMenu = document.getElementById('profile-menu');

function showProfileMenu() {
    profile.classList.toggle('show');
    profile.querySelector('i').classList.toggle('fa-angle-up');
    document.addEventListener('click', closeProfileMenu);
}

function closeProfileMenu(event) {
    if (!profileMenu.contains(event.target) && !profile.contains(event.target)) {
        profile.querySelector('i').classList.remove('fa-angle-up');
        profile.classList.remove('show');
        document.removeEventListener('click', closeProfileMenu);
    }
}

// ClickedState - Top Tabs
const topTabs = document.querySelectorAll('.toptab');
topTabs.forEach(function (topTab) {
    topTab.addEventListener('click', addBottomBorder);
});
function addBottomBorder(event) {
    topTabs.forEach(function (topTab) {
        topTab.classList.remove('clickedState');
        removeLeftBorder();
    });
    event.target.classList.add('clickedState');
}

function removeBottomBorder() {
    topTabs.forEach(function (topTab) {
        topTab.classList.remove('clickedState');
    });
}

// sidetabClickedState - SideTabs
const sidetabs = document.querySelectorAll('.sidetab');
sidetabs.forEach(function (sidetab) {
    sidetab.addEventListener('click', addLeftBorder);
});
function addLeftBorder(event) {
    sidetabs.forEach(function (sidetab) {
        sidetab.classList.remove('sidetabClickedState');
        removeBottomBorder();
    });
    if (event.currentTarget.classList.contains('sidetab') || sidebar.classList.contains('active')) {
        event.currentTarget.classList.add('sidetabClickedState');
    }
}

function removeLeftBorder() {
    sidetabs.forEach(function (sidetab) {
        sidetab.classList.remove('sidetabClickedState');
    });
}

// All Notes Tab
const allNotesTab = document.querySelector('.allnotes-tab');
function goToAllNotesTab() {
    noteCards.forEach(function (note) {
        note.style.display = 'block';

        // remove archived note
        const archived = note.classList.contains('archived');
        if (archived) {
            note.style.display = 'none';
        } else {
            note.style.display = 'block';
        }
    });
}

// Pinned Tab
const pinTab = document.getElementById('pin-tab');
pinTab.addEventListener('click', function () {
    noteCards.forEach(function (note) {
        const pinned = note.classList.contains('pinned')
        if (pinned) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
});
// pinning note
const pins = document.querySelectorAll(".pin-icon");
pins.forEach(function (pin) {
    pin.addEventListener('click', function () {
        pin.closest('.note').classList.toggle('pinned');
        pin.classList.toggle('material-icons');
        if (pin.classList.contains('material-icons')) {
            pin.innerHTML = 'push_pin';
            pin.classList.toggle('bi-pin');
        } else {
            pin.innerHTML = '';
            pin.classList.toggle('bi-pin');
        }
        storeNoteStatus();
    });
});

// Function to store pinned notes in local storage
function storeNoteStatus() {
    const pinnedNotes = document.querySelectorAll('.note.pinned');
    const starredNotes = document.querySelectorAll('.note.starred');
    const archivedNotes = document.querySelectorAll('.note.archived');

    const pinnedNoteIds = Array.from(pinnedNotes).map(note => note.id);
    const starredNoteIds = Array.from(starredNotes).map(note => note.id);
    const archivedNoteIds = Array.from(archivedNotes).map(note => note.id);

    localStorage.setItem('pinnedNotes', JSON.stringify(pinnedNoteIds));
    localStorage.setItem('starredNotes', JSON.stringify(starredNoteIds));
    localStorage.setItem('archivedNotes', JSON.stringify(archivedNoteIds));
}

// Function to load pinned notes from local storage
function loadNoteStatus(noteType, className, iconClass) {
    const noteIds = JSON.parse(localStorage.getItem(`${noteType}Notes`)) || [];
    noteIds.forEach(noteId => {
        const note = document.getElementById(noteId);
        if (note) {
            note.classList.add(className);
            if (iconClass) {
                const icon = note.querySelector(`.${iconClass}`);
                if (icon) {
                    // Adjust icon appearance based on note type
                    if (noteType === 'pinned') {
                        icon.innerHTML = 'push_pin';
                        icon.classList.add('material-icons');
                        icon.classList.remove('bi-pin');
                    } else if (noteType === 'starred') {
                        icon.classList.add('yellow-star');
                        icon.classList.add('fa-solid');
                    } else if (noteType === 'archived') {
                        // Check if note is archived, if not, update the menu icon
                        const archiveOption = note.classList.contains('archived') ? "Unarchive" : "Archive";
                        const archiveButton = note.querySelector('.archive-btn');
                        if (archiveButton) {
                            archiveButton.innerHTML = `<i class="uil uil-archive"></i>${archiveOption}`;
                        }
                    }
                }
            }
        }
    });
}

// Favorites Tab
const favTab = document.getElementById('fav-tab');
favTab.addEventListener('click', function () {
    noteCards.forEach(function (note) {
        const starred = note.classList.contains('starred');
        if (starred) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
});
// fav notes
const stars = document.querySelectorAll(".star-icon");
stars.forEach(function (star) {
    star.addEventListener('click', function () {
        const note = star.closest('.note');
        note.classList.toggle('starred');
        star.classList.toggle('fa-solid');

        if (note.classList.contains('starred')) {
            star.classList.add('yellow-star');
        } else {
            star.classList.remove('yellow-star');
        }
        storeNoteStatus();
    });
});
// Archive Tab
const archiveTab = document.getElementById('archive-tab');
archiveTab.addEventListener('click', function () {
    noteCards.forEach(function (note) {
        const archived = note.classList.contains('archived');
        if (archived) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
        removeBottomBorder();
    });
});
// Contact-Us Tab
const contactTab = document.getElementById('contact-tab');
const socialNotes = document.querySelectorAll('.social-note');
const regularNotes = document.querySelectorAll('.regular-note');
const notSocialNotes = document.querySelectorAll('.note:not(.social-note)');
contactTab.addEventListener('click', function () {
    notSocialNotes.forEach(function (notSocialNote) {
        notSocialNote.style.display = 'none';
    });
    socialNotes.forEach(function (socialNote) {
        socialNote.style.display = 'block';
    });
});

const otherTabs = document.querySelectorAll('.tab:not(#contact-tab)');
otherTabs.forEach(function (otherTab) {
    otherTab.addEventListener('click', function () {
        // Hide social notes
        socialNotes.forEach(function (socialNote) {
            socialNote.style.display = 'none';
        });
    });
});


// SEARCH NOTES
let search = document.getElementById("searchBar");
let noteCards = document.querySelectorAll('.note');

search.addEventListener('input', function () {
    let searchTerm = search.value.toLowerCase();

    noteCards.forEach(function (note) {
        let title = note.querySelector("p").innerText.toLowerCase();
        let description = note.querySelector("span").innerText.toLowerCase();
        let noteText = title + " " + description;

        if (noteText.includes(searchTerm)) {
            note.style.display = 'block';
        } else {
            note.style.display = 'none';
        }
    });
});

// EXPANDABLE SIDEBAR
const sidebar = document.querySelector('.sidebar');
const menubar = sidebar.querySelector('.menubar');

function expandSideBar() {
    sidebar.classList.toggle('active');
    document.addEventListener('click', unexpandSideBar);
}
function unexpandSideBar(event) {
    if (!menubar.contains(event.target) && !sidebar.contains(event.target) && !navigation.contains(event.target)) {
        sidebar.classList.remove('active');
        document.removeEventListener('click', unexpandSideBar);
    }
}


// COLOR PALLET:
const colorPallet = document.querySelector('.color-pallet');
const colors = document.querySelectorAll('.color');
const colorSchemeBtn = document.getElementById('color-scheme');
const noteDates = document.querySelectorAll('.bottom-content span');
const settingsIcons = document.querySelectorAll('.bottom-content .settings i');
const body = document.body;

//Theme pallet - open/close
function showPallet() {
    if (!colorPallet.classList.contains('active')) {
        colorPallet.classList.add('active');
        document.addEventListener('click', closePallet);
    } else {
        colorPallet.classList.remove('active');
    }
}
function closePallet() {
    if (!colorPallet.contains(event.target) && !colorSchemeBtn.contains(event.target)) {
        colorPallet.classList.remove('active');
        document.removeEventListener('click', closePallet);
    }
}
//Theme Pallet List - passing theme name for changeTheme
colors.forEach(color => {
    color.addEventListener('click', function () {
        themeName = color.textContent.replace(/\s/g, '');
        changeTheme(themeName);
    });
});
// Change Theme Function
function changeTheme(currentTheme) {
    body.className = ''; // Remove existing classes
    body.classList.add(currentTheme); // Add the selected theme class
    themeText.innerText = currentTheme === 'darkmode' ? 'Light' : 'Dark';
    localStorage.setItem('theme', currentTheme);
    noteDates.forEach(function (noteDate) {
        noteDate.style.color = currentTheme === 'lightmode' || currentTheme === 'darkmode' ? '#6d6d6d' : 'var(--note-fonts)';
    });
    settingsIcons.forEach(function (settingsIcon) {
        settingsIcon.style.color = currentTheme === 'lightmode' || currentTheme === 'darkmode' ? '#6d6d6d' : 'var(--note-fonts)';
    });
}
// On Reload get Theme
document.addEventListener('DOMContentLoaded', function () {
    firstLi.classList.add('clickedState'); // All notes tab already underlined
    let currentTheme = localStorage.getItem('theme');
    changeTheme(currentTheme);
    loadNoteStatus('pinned', 'pinned', 'pin-icon');
    loadNoteStatus('starred', 'starred', 'star-icon');
    loadNoteStatus('archived', 'archived', null);
    // To remove Archived notes coz displaying in allNotes even after refresh
    const archiveTab = document.getElementById('archive-tab');
    const allNotesTab = document.querySelector('.allnotes-tab');
    archiveTab.click();
    allNotesTab.click();
});

// Dark Mode
const themeText = document.getElementById('themeText');
function darkMode() {
    const currentTheme = !body.classList.contains('darkmode') ? 'darkmode' : 'lightmode';
    changeTheme(currentTheme);
    themeText.innerText = currentTheme === 'darkmode' ? 'Light' : 'Dark';
}