import { runCmd, stringToColumns } from "./utils";

export async function listServices(): Promise<{ [serviceName: string]: boolean }> {
    const cmd = 'brew services list';
  
    const data = await runCmd(cmd);
    const [, ...rows] = data.split('\n').map((str) => stringToColumns(str).split(' '));
  
    return rows.reduce(
      (prev, [name, status]) =>
        !name
          ? prev
          : {
              ...prev,
              [name]: status === 'started',
            },
      {}
    );
  }
  