# -*- coding: utf-8 -*-

import os
basedir = os.path.abspath(os.path.dirname(__file__))
data_path = os.path.join(basedir, 'app', 'static', 'data')          #下载各类文件的存储路径
head_img_path = os.path.join(basedir, 'app', 'static', 'head_img')  #下载头像的存储路径
qr_img_path = os.path.join(basedir, 'app', 'static', 'qr')          #登陆二维码存储路径
log_path = os.path.join(basedir, 'app', 'log')                      #日志路径
login_img_path = os.path.join(basedir, 'app', 'static', 'qr', 'login.png')   #登陆成功图片的存储路径

class Config:
    """common configuration"""
    SECRET_KEY = os.environ.get("SECRET_KEY") or "hard to guess string"
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    SQLALCHEMY_RECORD_QUERIES = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    @staticmethod
    def init_app(app):
        pass
"""
development configuration
 -- DEBUG: debug mode
 -- SQLALCHEMY_DATABASE_URI:
    -- The database URI that should be used for the connection.
more connection URI format:
 -- Postgres:
    -- postgresql://scott:tiger@localhost/mydatabase
 -- MySQL:
    -- mysql://scott:tiger@localhost/mydatabase
 -- Oracle:
    -- oracle://scott:tiger@127.0.0.1:1521/sidname
"""
class DevelopmentConfig(Config):
    """development configuration"""
    DEBUG = True
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24  # session expire time
    PREFERRED_URL_SCHEME = "https"
    SQLALCHEMY_DATABASE_URI = "mysql://root:123456@localhost/crm_dev"
    WTF_CSRF_ENABLED = True


class TestingConfig(Config):
    """testing configuration"""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "save_msg.sqlite")
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """production configuration"""
    # PREFERRED_URL_SCHEME = "https"
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24  # session expire time
    SQLALCHEMY_DATABASE_URI = "mysql://root@localhost/crm"
    WTF_CSRF_ENABLED = True
config = {
    "develop": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}