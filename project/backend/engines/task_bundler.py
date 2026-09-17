def find_compatible_tasks(tasks, session):
    groups = []
    # simplified logic for compatibility
    for task in tasks:
        groups.append([task])
    return groups

def get_bundled_tasks(session):
    return []
