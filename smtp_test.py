import os
from dotenv import load_dotenv
import smtplib

load_dotenv()

print("SMTP_PASS =", repr(os.getenv("SMTP_PASS")))
