import spacy

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

# Example text
text = "I am working on the Resume Screening System."

# Process the text
doc = nlp(text)

# Print out entities (if any), tokens, and their parts of speech
for token in doc:
    print(f"{token.text}: {token.pos_}")

# Print named entities (if any)
for ent in doc.ents:
    print(f"Entity: {ent.text}, Label: {ent.label_}")
