import r2pipe
import sys
import re

# return -1: error
def info(c_name):
    # class start
    c_start = d.find(f'public class {c_name}')
    if c_start < 0:
        print("class doesn't exists")
        return -1
    else:
        print(f"-------------- {c_name} -------------")
    # fields
    f_start = d.find('// Fields', c_start)
    f_end = d.find('\n\n', f_start)
    # methods
    m_start = d.find('// Methods', c_start)
    m_end = d.find('\n\n', m_start)
    # class end
    c_end = d.find('\n}\n', c_start)
    if m_end < 0:
        m_end = c_end
    if f_end < 0:
        f_end = m_end
    return c_start, c_end, f_start, f_end, m_start, m_end

def functions(d, c_name, m_start, m_end):
    s = d[m_start : m_end]
    ss = s.split('\n')[1:]
    
    # remove element like \[\w+\] -> [CompilerGeneratedAttribute]
    sss = []
    for x in ss:
        if not re.search('^\s*\[\w+\]', x):
            sss.append(x)

    for i,k in zip(sss[0::2], sss[1::2]):
        m_name = k.split('(')[0].split()[-1]
        m_offset = re.split(' ', i)[4]
        print(f'{m_name}    {m_offset}')
        r.cmd(f'af {c_name}_{m_name} @ {m_offset}')
    r.cmd('afl* > script.r2')


if len(sys.argv) < 4:
    print(f"{sys.argv[0]} <binary> <dump.cs> <class> [r]ecursive")
    exit(1)

recursive = False
if len(sys.argv) == 5 and sys.argv[4] == 'r':
    recursive = True

r = r2pipe.open(sys.argv[1])

f = open(sys.argv[2], 'r')
d = f.read()
f.close()

c_start, c_end, f_start, f_end, m_start, m_end = info(sys.argv[3])
functions(d, sys.argv[3], m_start, m_end)

if recursive:
    classes = []
    fields = d[f_start : f_end]
    fields_split = fields.split('\n')[1:-2]
    for i in fields_split:
        if re.search('^\s*\[\w+\]', i):
            continue
        c_name = i.split(';')[0]
        c_name = c_name.split()[1:-1]
        c_name = ' '.join(c_name)
        classes.append(c_name)

    for i in set(classes):
        try:
            c_start, c_end, f_start, f_end, m_start, m_end = info(i)
            functions(d, i, m_start, m_end)
        except:
            pass
