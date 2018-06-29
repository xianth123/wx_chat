# -*- coding: utf-8 -*-
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from config import config

config_name = 'testing'

app = Flask(__name__)
app.config.from_object(config[config_name])
config[config_name].init_app(app)

db = SQLAlchemy(app)

from chat.views import *