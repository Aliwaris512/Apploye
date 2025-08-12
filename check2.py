from py_vapid import Vapid01
from cryptography.hazmat.primitives import serialization

# Create instance
vapid = Vapid01()

# Generate keys
vapid.generate_keys()

# Serialize private key to PEM
private_pem = vapid.private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

# Serialize public key to PEM
public_pem = vapid.public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
)

# Save to files
with open("vapid_private.pem", "wb") as f:
    f.write(private_pem)

with open("vapid_public.pem", "wb") as f:
    f.write(public_pem)

print("Keys generated and saved!")



