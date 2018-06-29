# -*- coding: utf-8 -*-
import os
import time
import shutil
from threading import Thread

from flask import render_template, Response, request

from app import app
from app.chat import itchat_run
from app.utils import generator_string_id
from app.models import GroupMsg
from app.models import User
from app.models import Group
from app.models import Robot
from config import basedir


@app.route('/')
def hello_world():
    user_id = generator_string_id(16, 2)
    thr = Thread(target=itchat_run, args=[user_id])
    thr.start()
    qr_img_file_path = os.path.join(basedir, 'app', 'static', 'qr',  user_id+'.png')
    while not os.path.exists(qr_img_file_path):
        time.sleep(0.1)
    return render_template('login/index.html', filename='qr/{}.png'.format(user_id))


@app.route('/query/', methods=['GET'])
def data_query():
    group = request.args.get('group', '')
    nick_name = request.args.get('nick_name', '')
    actual_name = request.args.get('actual_name', '')
    type = request.args.get('type', '')
    start_time = request.args.get('start_time', '')
    end_time = request.args.get('end_time', '')

    offset = request.args.get('offset', 0, int)
    limit = request.args.get('limit', 20, int)

    query = GroupMsg.query
    if group:
        query = query.filter(GroupMsg.group==group)
    if nick_name:
        query = query.filter(GroupMsg.user_nick_name==nick_name)
    if actual_name:
        query = query.filter(GroupMsg.user_actual_name==actual_name)
    if type and type != -1:
        query = query.filter(GroupMsg.type==type)

    count = query.count()
    msgs = query.order_by(GroupMsg.create_time.desc()).offset(offset).limit(limit).all()
    return render_template('login/query.html', msgs=msgs[::-1], offset=offset,
                           limit=limit, count=count, int=int, abs=abs, type=type,
                           group=group, nick_name=nick_name, actual_name=actual_name)


@app.route('/users/', methods=['GET'])
def data_users():
    group = request.args.get('group', '')
    nick_name = request.args.get('nick_name', '')
    remark_name = request.args.get('remark_name', '')
    display_name = request.args.get('display_name', '')
    sex = request.args.get('sex', '')
    province = request.args.get('province', '')
    city = request.args.get('city', '')

    offset = request.args.get('offset', 0, int)
    limit = request.args.get('limit', 20, int)
    query = User.query

    if group:
        query = query.filter_by(group=group)
    if nick_name:
        query = query.filter_by(nick_name=nick_name)
    if remark_name:
        query = query.filter_by(remark_name=remark_name)
    if display_name:
        query = query.filter_by(display_name=display_name)
    if sex:
        query = query.filter_by(sex=sex)
    if province:
        query = query.filter_by(province=province)
    if city:
        query = query.filter_by(city=city)

    count = query.count()
    users = query.order_by(User.id.desc()).offset(offset).limit(limit).all()

    return render_template('login/users.html', users=users, group=group,
                           nick_name=nick_name, remark_name=remark_name,
                           display_name=display_name, sex=sex, province=province,
                           city=city, int=int, abs=abs, offset=offset, limit=limit, count=count)


@app.route('/groups/', methods=['GET'])
def data_groups():
    group = request.args.get('group', '')
    hot = request.args.get('hot', '7')

    offset = request.args.get('offset', 0, int)
    limit = request.args.get('limit', 20, int)
    query = Group.query

    if group:
        query = query.filter_by(group_name=group)

    count = query.count()
    groups = query.order_by(Group.id.desc()).offset(offset).limit(limit).all()
    return render_template('login/groups.html', groups=groups, int=int, abs=abs,
                           offset=offset, limit=limit, count=count)

@app.route('/robots/', methods=['GET'])
def data_robots():
    status = request.args.get('status', '')

    offset = request.args.get('offset', 0, int)
    limit = request.args.get('limit', 20, int)
    query = Robot.query

    if status:
        query = query.filter_by(status=status)

    count = query.count()
    robots = query.order_by(Robot.status.desc()).offset(offset).limit(limit).all()
    return render_template('login/robots.html', robots=robots, int=int, abs=abs,
                           offset=offset, limit=limit, count=count)




# @app.route('/img/{img_id}')
# def img(img_id):
#     print(img_id)
#     img = file(os.path.join(basedir, img_id))
#     resp = Response(img, mimetype='image/png')
#     return resp