
const robotProducts = {
    home: {
        name: "NEXORA Home",
        category: "DOMESTIC ASSISTANCE",
        description:
            "A fictional domestic humanoid concept designed to assist with everyday routines and interact with smart environments.",
        features: [
            "Conceptual voice interaction",
            "Smart-home integration concept",
            "Assistance with routine tasks",
            "Human-centered design"
        ]
    },

    industrial: {
        name: "NEXORA Industrial",
        category: "INDUSTRIAL SUPPORT",
        description:
            "A fictional industrial humanoid concept designed for logistics support and repetitive workplace activities.",
        features: [
            "Conceptual operator interface",
            "Warehouse assistance concept",
            "Repetitive-task support",
            "Industrial environment design"
        ]
    },

    care: {
        name: "NEXORA Care",
        category: "COMPANION ROBOTICS",
        description:
            "A fictional companion robot concept for welcoming environments, hospitality, and guided assistance.",
        features: [
            "Conceptual conversational interface",
            "Visitor guidance concept",
            "Hospitality assistance",
            "Accessible interaction design"
        ]
    }
};

const productButtons = document.querySelectorAll("[data-product]");

function closeProductDialog() {
    const dialog = document.querySelector("#product-dialog");

    if (dialog?.open) {
        dialog.close();
    }
}

function openProductDialog(productKey) {
    const product = robotProducts[productKey];

    if (!product) {
        return;
    }

    const dialog = document.querySelector("#product-dialog");

    document.querySelector("#dialog-category").textContent =
        product.category;

    document.querySelector("#dialog-title").textContent =
        product.name;

    document.querySelector("#dialog-description").textContent =
        product.description;

    const featureList = document.querySelector("#dialog-features");
    featureList.replaceChildren();

    product.features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        featureList.appendChild(item);
    });

    dialog.showModal();
}

productButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openProductDialog(button.dataset.product);
    });
});

document.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-dialog]")) {
        closeProductDialog();
    }
});
