import qrcode

# Link for QR Code
link = "https://sudoku-lab.vercel.app"

# Create QR Code
qr = qrcode.make(link)

# Save QR Code Image
qr.save("sudoku_qr.png")

print("QR Code Generated Successfully!")