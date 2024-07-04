import tkinter as tk
from tkinter import ttk, messagebox

class Card:
    def __init__(self, training_type, speciality_rate_up, is_unique, is_link):
        self.training_type = training_type
        self.speciality_rate_up = speciality_rate_up
        self.is_unique = is_unique
        self.is_link = is_link
        self.calculate_rates()

    def calculate_rates(self):
        n = 20 if self.is_unique else 0
        speciality_value = (100 + self.speciality_rate_up) * (1 + n / 100)
        self.speciality_rate = (speciality_value / (speciality_value + 450)) * 100
        self.non_speciality_rate = (100 / (speciality_value + 450)) * 100
        self.slack_rate = (50 / (speciality_value + 450)) * 100

    def __str__(self):
        return (f"Training: {self.training_type}, "
                f"Speciality Rate Up: {self.speciality_rate_up}, "
                f"Unique: {self.is_unique}, "
                f"Link: {self.is_link}, "
                f"Speciality Rate: {self.speciality_rate:.2f}%, "
                f"Non-speciality Rate: {self.non_speciality_rate:.2f}%, "
                f"Slack Rate: {self.slack_rate:.2f}%")

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Card Setting")
        
        self.cards = []
        self.max_cards = 5
        
        self.create_widgets()

    def create_widgets(self):
        self.training_label = tk.Label(self.root, text="Training Type")
        self.training_label.grid(row=0, column=0)
        self.training_combobox = ttk.Combobox(self.root, values=["Speed", "Stamina", "Power", "Guts", "Wisdom"])
        self.training_combobox.grid(row=0, column=1)

        self.rate_label = tk.Label(self.root, text="Speciality Rate Up")
        self.rate_label.grid(row=1, column=0)
        self.rate_spinbox = tk.Spinbox(self.root, from_=0, to=200)
        self.rate_spinbox.grid(row=1, column=1)

        self.unique_var = tk.BooleanVar()
        self.unique_checkbox = tk.Checkbutton(self.root, text="Unique", variable=self.unique_var)
        self.unique_checkbox.grid(row=2, column=0)

        self.link_var = tk.BooleanVar()
        self.link_checkbox = tk.Checkbutton(self.root, text="Link", variable=self.link_var)
        self.link_checkbox.grid(row=2, column=1)

        self.add_button = tk.Button(self.root, text="Add Card", command=self.add_card)
        self.add_button.grid(row=3, column=0, columnspan=2)

        self.cards_listbox = tk.Listbox(self.root)
        self.cards_listbox.grid(row=4, column=0, columnspan=2)
        
        self.delete_button = tk.Button(self.root, text="Delete Card", command=self.delete_card)
        self.delete_button.grid(row=5, column=0, columnspan=2)

    def add_card(self):
        if len(self.cards) >= self.max_cards:
            messagebox.showwarning("Limit reached", "You can only add up to 5 cards.")
            return
        
        training_type = self.training_combobox.get()
        try:
            speciality_rate_up = int(self.rate_spinbox.get())
        except ValueError:
            messagebox.showwarning("Invalid input", "Speciality Rate Up must be an integer.")
            return

        is_unique = self.unique_var.get()
        is_link = self.link_var.get()

        card = Card(training_type, speciality_rate_up, is_unique, is_link)
        self.cards.append(card)
        self.update_cards_listbox()

    def delete_card(self):
        selected_index = self.cards_listbox.curselection()
        if not selected_index:
            messagebox.showwarning("No selection", "Please select a card to delete.")
            return

        index = selected_index[0]
        del self.cards[index]
        self.update_cards_listbox()

    def update_cards_listbox(self):
        self.cards_listbox.delete(0, tk.END)
        for card in self.cards:
            self.cards_listbox.insert(tk.END, str(card))

if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
