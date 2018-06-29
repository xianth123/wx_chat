# -*- coding: utf-8 -*-

from flask_script import Manager, Shell
from flask_migrate import Migrate, MigrateCommand
from app import app
from app import db
from app.models import GroupMsg, Group, User

manager = Manager(app)
migrate = Migrate(app, db)


def make_shell_context():
    return dict(app=app, db=db, GroupMsg=GroupMsg, Group=Group, User=User)

manager.add_command("shell", Shell(make_context=make_shell_context))
manager.add_command('db', MigrateCommand)


@manager.command
def db_create():
    db.create_all()
    print '<db is created>'


if __name__ == '__main__':

    manager.run()
