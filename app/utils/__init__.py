# -*- coding: utf-8 -*-
import sys
import json
import time
import hashlib
from datetime import datetime

reload(sys)

sys.setdefaultencoding( "utf-8" )


def zh_str(s):
    return json.dumps(s, ensure_ascii=False, encoding='UTF-8', indent=4)


def log(s, filename='log.txt'):
    format = '%H:%M:%S'
    value = time.localtime(int(time.time()))
    dt = time.strftime(format, value)
    with open(filename, 'a') as f:
        # print (dt, *args, file=f, **kwargs)
        print >>f, '{} \n {}'.format(dt, s)
        print


def generator_string_id(length=16, start_num=1):
    # 填充数 + 2006-01-02 到当前时间的秒数 + 秒后两位 + 3位随机数
    # length 最小15
    import random
    diff = str(int((datetime.now() - datetime(2006, 01, 02)).total_seconds() * 100))
    randstr = random.randint(100, 999)
    fill = '0' * (length - 4 - len(diff))
    id = '{start_num}{fill}{diff}{randstr}'.format(
        start_num=start_num, fill=fill, diff=diff, randstr=randstr)
    return id

def get_md5(s):
    md = hashlib.md5()
    md.update(s.encode('utf-8'))
    return md.hexdigest()