import { getCareers, getCareer } from '../../services/careerService';

jest.mock('../../services/apiClient', () => jest.fn());

const apiRequest = jest.requireMock('../../services/apiClient');

describe('careerService (cliente)', () => {
  afterEach(() => jest.resetAllMocks());

  it('getCareers pide GET /careers sin filtros', async () => {
    apiRequest.mockResolvedValue({ careers: [] });
    await getCareers('jwt');
    expect(apiRequest).toHaveBeenCalledWith('/careers', { token: 'jwt' });
  });

  it('getCareers agrega search y area como query params', async () => {
    apiRequest.mockResolvedValue({ careers: [] });
    await getCareers('jwt', { search: 'biologia', area: 2 });
    expect(apiRequest).toHaveBeenCalledWith('/careers?search=biologia&area=2', { token: 'jwt' });
  });

  it('getCareer pide GET /careers/:id', async () => {
    apiRequest.mockResolvedValue({ career: {} });
    await getCareer('jwt', 5);
    expect(apiRequest).toHaveBeenCalledWith('/careers/5', { token: 'jwt' });
  });
});
