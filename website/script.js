
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

/* NEXORA robot comparison functionality */

const comparisonProducts = {
    home: {
        name: "NEXORA Home",
        role: "Personal home assistance",
        interaction: "Voice and touch",
        environment: "Residential spaces",
        focus: "Everyday convenience and assistance"
    },

    industrial: {
        name: "NEXORA Industrial",
        role: "Industrial task assistance",
        interaction: "Operator controls and voice",
        environment: "Factories and industrial facilities",
        focus: "Workflow support and operational efficiency"
    },

    care: {
        name: "NEXORA Care",
        role: "Care and companionship assistance",
        interaction: "Voice and touch",
        environment: "Care facilities and home environments",
        focus: "Companionship and daily support"
    }
};

const comparisonSection = document.querySelector("#compare");

if (comparisonSection) {
    const comparisonInputs = [
        ...comparisonSection.querySelectorAll(
            '.comparison-option input[type="checkbox"]'
        )
    ];

    const comparisonResults = comparisonSection.querySelector(
        "#comparison-results"
    );

    const resetComparisonButton = comparisonSection.querySelector(
        "#reset-comparison"
    );

    function renderComparison() {
        const selectedRobots = comparisonInputs
            .filter(input => input.checked)
            .map(input => comparisonProducts[input.value])
            .filter(Boolean);

        if (selectedRobots.length < 2) {
            const message = document.createElement("p");
            message.textContent =
                "Select at least two robots to compare them.";

            comparisonResults.replaceChildren(message);
            return;
        }

        const features = [
            { label: "Primary role", key: "role" },
            { label: "Interaction", key: "interaction" },
            { label: "Intended environment", key: "environment" },
            { label: "Design focus", key: "focus" }
        ];

        const table = document.createElement("table");
        table.className = "comparison-table";

        const tableHead = document.createElement("thead");
        const headingRow = document.createElement("tr");
        const featureHeading = document.createElement("th");

        featureHeading.textContent = "Feature";
        headingRow.appendChild(featureHeading);

        selectedRobots.forEach(robot => {
            const heading = document.createElement("th");
            heading.textContent = robot.name;
            headingRow.appendChild(heading);
        });

        tableHead.appendChild(headingRow);
        table.appendChild(tableHead);

        const tableBody = document.createElement("tbody");

        features.forEach(feature => {
            const row = document.createElement("tr");
            const labelCell = document.createElement("td");

            labelCell.textContent = feature.label;
            row.appendChild(labelCell);

            selectedRobots.forEach(robot => {
                const cell = document.createElement("td");
                cell.textContent = robot[feature.key];
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        comparisonResults.replaceChildren(table);
    }

    comparisonInputs.forEach(input => {
        input.addEventListener("change", renderComparison);
    });

    resetComparisonButton.addEventListener("click", () => {
        comparisonInputs.forEach(input => {
            input.checked =
                input.value === "home" ||
                input.value === "industrial";
        });

        renderComparison();
    });

    renderComparison();
}

/* NEXORA scroll-reveal observer */

const revealElements = document.querySelectorAll(
    ".products-section .product-card, " +
    ".comparison-section, " +
    "#about, " +
    "#contact"
);

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(element => {
        element.classList.add("is-visible");
    });
} else {
    revealElements.forEach(element => {
        element.classList.add("reveal-on-scroll");
    });

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}
